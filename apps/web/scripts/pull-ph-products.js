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
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'manual'
    })
    const location = response.headers.get('location')
    if (location) {
      return extractDomain(location)
    }
    return null
  } catch {
    return null
  }
}

async function getProductDomain(product) {
  // Find the Website link in productLinks
  if (product.productLinks && product.productLinks.length > 0) {
    const websiteLink = product.productLinks.find(l => l.type === 'Website')
    if (websiteLink) {
      return await followRedirect(websiteLink.url)
    }
  }
  
  // Fallback to website field
  if (product.website) {
    return await followRedirect(product.website)
  }
  
  return null
}

async function main() {
  const allProducts = []
  let cursor
  const targetCount = 500

  console.log(`🚀 Pulling top ${targetCount} Product Hunt products...\n`)

  while (allProducts.length < targetCount) {
    const { products, nextCursor } = await fetchProducts(cursor)
    
    if (products.length === 0) break
    
    allProducts.push(...products)
    console.log(`  Fetched ${allProducts.length} products...`)
    
    if (!nextCursor) break
    cursor = nextCursor
    
    await new Promise(r => setTimeout(r, 200))
  }

  // Debug: show first 3 raw products
  console.log('\nDebug - first 3 raw products:')
  allProducts.slice(0, 3).forEach(p => {
    console.log(`  ${p.name}:`)
    console.log(`    website: ${p.website}`)
    console.log(`    productLinks: ${JSON.stringify(p.productLinks)}`)
  })
  console.log('')

  // Dedupe by domain - need to resolve redirects
  console.log('Resolving product domains (this takes a minute)...')
  const seen = new Set()
  const processed = []
  
  for (const p of allProducts) {
    if (processed.length >= targetCount) break
    
    const domain = await getProductDomain(p)
    if (!domain || seen.has(domain)) continue
    seen.add(domain)
    
    processed.push({
      name: p.name,
      domain,
      slug: p.slug,
      tagline: p.tagline,
      votes: p.votesCount
    })
    
    if (processed.length % 50 === 0) {
      console.log(`  Resolved ${processed.length} products...`)
    }
  }

  console.log(`\n✅ Got ${processed.length} unique products\n`)

  // SQL output
  console.log('-- SQL to insert into ph_products (run in Supabase):')
  console.log('INSERT INTO ph_products (name, domain, slug, category) VALUES')
  
  const values = processed.map((p, i) => {
    const name = p.name.replace(/'/g, "''")
    const isLast = i === processed.length - 1
    return `  ('${name}', '${p.domain}', '${p.slug}', 'Product Hunt')${isLast ? ';' : ','}`
  })
  
  console.log(values.join('\n'))
}

main().catch(console.error)