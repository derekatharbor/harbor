// Pull top Product Hunt products via their GraphQL API
// Run: PH_TOKEN=your_token node scripts/pull-ph-products.js

const PH_TOKEN = process.env.PH_TOKEN

if (!PH_TOKEN) {
  console.error('Missing PH_TOKEN. Get one at https://www.producthunt.com/v2/oauth/applications')
  process.exit(1)
}

async function fetchProducts(cursor) {
  const query = `
    query {
      posts(order: VOTES, first: 50${cursor ? `, after: "${cursor}"` : ''}) {
        edges {
          node {
            name
            tagline
            votesCount
            url
            slug
            website
            productLinks {
              url
              type
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `

  const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    throw new Error(`PH API error: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  
  if (data.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`)
  }

  const edges = data.data?.posts?.edges || []
  const pageInfo = data.data?.posts?.pageInfo || {}

  return {
    products: edges.map(e => e.node),
    nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined
  }
}

function extractDomain(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname.replace(/^www\./, '')
    // Skip producthunt.com URLs
    if (domain === 'producthunt.com') return null
    return domain
  } catch {
    return null
  }
}

// Follow PH redirect to get real URL
async function followRedirect(url) {
  try {
    // Actually follow the redirect chain
    const response = await fetch(url, { 
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HarborBot/1.0)'
      }
    })
    
    // The final URL after redirects
    const finalUrl = response.url
    const domain = extractDomain(finalUrl)
    
    return domain
  } catch (err) {
    return null
  }
}

async function getProductDomain(product) {
  // Find the Website link in productLinks
  if (product.productLinks && product.productLinks.length > 0) {
    const websiteLink = product.productLinks.find(l => l.type === 'Website')
    if (websiteLink) {
      const domain = await followRedirect(websiteLink.url)
      return domain
    }
  }
  
  // Fallback to website field
  if (product.website) {
    const domain = await followRedirect(product.website)
    return domain
  }
  
  return null
}

async function main() {
  const allProducts = []
  let cursor
  const targetCount = 500
  const fetchCount = 1200 // Over-fetch since ~50% will fail

  console.log(`🚀 Pulling top ${fetchCount} Product Hunt products (targeting ${targetCount} resolved)...\n`)

  while (allProducts.length < fetchCount) {
    try {
      const { products, nextCursor } = await fetchProducts(cursor)
      
      if (products.length === 0) break
      
      allProducts.push(...products)
      console.log(`  Fetched ${allProducts.length} products...`)
      
      if (!nextCursor) break
      cursor = nextCursor
      
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      if (err.message.includes('429')) {
        console.log(`\n⚠️  Rate limited. Continuing with ${allProducts.length} products...\n`)
        break
      }
      throw err
    }
  }

  // Dedupe by domain - need to resolve redirects
  console.log('Resolving product domains...')
  const seen = new Set()
  const processed = []
  let failed = 0
  
  for (let i = 0; i < allProducts.length; i++) {
    if (processed.length >= targetCount) break
    
    const p = allProducts[i]
    const domain = await getProductDomain(p)
    
    if (!domain) {
      failed++
      continue
    }
    
    if (seen.has(domain)) continue
    seen.add(domain)
    
    processed.push({
      name: p.name,
      domain,
      slug: p.slug,
      tagline: p.tagline,
      votes: p.votesCount
    })
    
    if (processed.length % 50 === 0) {
      console.log(`  Resolved ${processed.length} products (${failed} failed)...`)
    }
  }

  console.log(`\n✅ Got ${processed.length} unique products (${failed} failed to resolve)\n`)

  // Build SQL with ON CONFLICT to handle existing products
  const sqlLines = [
    '-- Run this in Supabase SQL Editor',
    '-- Products that already exist will be skipped',
    '',
    'INSERT INTO ph_products (name, domain, slug, category) VALUES'
  ]
  
  const values = processed.map((p, i) => {
    const name = p.name.replace(/'/g, "''")
    const isLast = i === processed.length - 1
    return `  ('${name}', '${p.domain}', '${p.slug}', 'Product Hunt')${isLast ? '' : ','}`
  })
  
  sqlLines.push(...values)
  sqlLines.push('ON CONFLICT (domain) DO NOTHING;')
  
  const sql = sqlLines.join('\n')
  
  // Write to file
  const fs = require('fs')
  fs.writeFileSync('ph_products_insert.sql', sql)
  console.log(`📄 SQL written to ph_products_insert.sql`)
  
  // Also write first 20 to console for quick check
  console.log('\nFirst 20 products:')
  processed.slice(0, 20).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} (${p.domain})`)
  })
}

main().catch(console.error)