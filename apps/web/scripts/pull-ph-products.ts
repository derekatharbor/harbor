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
            website
            slug
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
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
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

  // Dedupe by domain
  const seen = new Set()
  const processed = allProducts
    .map(p => {
      const domain = extractDomain(p.website)
      if (!domain || seen.has(domain)) return null
      seen.add(domain)
      
      return {
        name: p.name,
        domain,
        slug: p.slug,
        tagline: p.tagline,
        votes: p.votesCount
      }
    })
    .filter(Boolean)
    .slice(0, targetCount)

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