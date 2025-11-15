// app/api/validate/schema/route.ts
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url, taskId } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { valid: false, message: 'Invalid URL format' },
        { status: 200 }
      )
    }

    // Fetch the page
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Harbor Schema Validator/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, message: `Failed to fetch page: ${response.status} ${response.statusText}` },
        { status: 200 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract all JSON-LD scripts
    const jsonLdScripts: any[] = []
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const content = $(elem).html()
        if (content) {
          jsonLdScripts.push(JSON.parse(content))
        }
      } catch (e) {
        // Skip invalid JSON
      }
    })

    if (jsonLdScripts.length === 0) {
      return NextResponse.json({
        valid: false,
        message: 'No JSON-LD schema found on this page. Make sure you saved and published your changes.'
      })
    }

    // Check for specific schema types based on task
    let foundRelevantSchema = false
    let schemaType = ''

    for (const schema of jsonLdScripts) {
      const type = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']]
      
      if (taskId?.includes('product') && type.includes('Product')) {
        foundRelevantSchema = true
        schemaType = 'Product'
        break
      }
      
      if (taskId?.includes('organization') && type.includes('Organization')) {
        foundRelevantSchema = true
        schemaType = 'Organization'
        break
      }
      
      if (taskId?.includes('faq') && type.includes('FAQPage')) {
        foundRelevantSchema = true
        schemaType = 'FAQPage'
        break
      }
      
      // Generic check if no specific task
      if (!taskId && (type.includes('Product') || type.includes('Organization'))) {
        foundRelevantSchema = true
        schemaType = type.find((t: string) => t === 'Product' || t === 'Organization') || ''
        break
      }
    }

    if (foundRelevantSchema) {
      return NextResponse.json({
        valid: true,
        message: `✓ ${schemaType} schema detected! AI models can now read your structured data.`,
        schemas: jsonLdScripts
      })
    }

    return NextResponse.json({
      valid: false,
      message: `Found ${jsonLdScripts.length} schema(s), but none matched what we're looking for. Double-check you pasted the right code.`
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { valid: false, message: 'Validation failed. Please try again.' },
      { status: 200 }
    )
  }
}
