#!/usr/bin/env node
/**
 * AI Pricing Hallucination Test
 * 
 * Tests whether ChatGPT and Claude accurately report SMB pricing
 * 
 * Usage:
 *   OPENAI_API_KEY=sk-xxx node hallucination-test.js
 *   OPENAI_API_KEY=sk-xxx ANTHROPIC_API_KEY=sk-ant-xxx node hallucination-test.js
 */

const fs = require('fs');

const testCases = [
  { brand: "15Five", query: "What is the pricing for 15Five performance management software?", truth: "$4/mo per user", domain: "15five.com" },
  { brand: "10 Fitness", query: "What is the monthly membership price for 10 Fitness gym?", truth: "$7.95 bi-weekly", domain: "10fitness.com" },
  { brand: "$300 Data Recovery", query: "How much does $300 Data Recovery charge for hard drive recovery?", truth: "$300 flat fee", domain: "300dollardatarecovery.com" },
  { brand: "1099PRO", query: "What is the annual pricing for 1099PRO tax software?", truth: "$449/year", domain: "1099pro.com" },
  { brand: "101domain.com", query: "What is the price for .com domain registration at 101domain.com?", truth: "$14.99/year", domain: "101domain.com" },
  { brand: "ISSA", query: "What is the cost of ISSA personal trainer certification?", truth: "$49 down, payment plans available", domain: "issaonline.com" },
  { brand: "100Devs", query: "What is the pricing for 100Devs coding bootcamp?", truth: "$200/month", domain: "100devs.org" },
  { brand: "11:11 Systems", query: "What is the per-TB pricing for 11:11 Systems cloud storage?", truth: "$6.96/TB", domain: "1111systems.com" },
  { brand: "[modern dope]", query: "What is the starting price for modern dope digital marketing services?", truth: "$850/month", domain: "moderndope.com" },
  { brand: "18Birdies", query: "Does 18Birdies golf app have a free version?", truth: "Yes - free tier available", domain: "18birdies.com" },
  { brand: "123Employee", query: "What is the pricing for 123Employee virtual assistant services?", truth: "Custom pricing, no upfront cost", domain: "123employee.com" },
  { brand: "1872 Consulting", query: "What does 1872 Consulting charge for IT recruiting services?", truth: "Custom/unknown pricing", domain: "1872consulting.com" },
];

async function queryOpenAI(query) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: query }],
      max_tokens: 300,
      temperature: 0
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || data.error?.message || "No response";
}

async function queryClaude(query) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: query }]
    })
  });
  const data = await response.json();
  return data.content?.[0]?.text || data.error?.message || "No response";
}

function truncate(str, len = 150) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

async function runTests() {
  console.log("\n🔍 AI PRICING HALLUCINATION TEST");
  console.log("=".repeat(60));
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("\n❌ OPENAI_API_KEY not set");
    console.log("Usage: OPENAI_API_KEY=sk-xxx node hallucination-test.js\n");
    process.exit(1);
  }

  const results = [];
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;
  
  console.log(`\nRunning ${testCases.length} tests against GPT-4o${hasClaude ? " + Claude" : ""}...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    process.stdout.write(`[${i + 1}/${testCases.length}] ${test.brand}... `);
    
    try {
      const gptResponse = await queryOpenAI(test.query);
      const claudeResponse = hasClaude ? await queryClaude(test.query) : null;
      
      results.push({
        ...test,
        gpt: gptResponse,
        claude: claudeResponse
      });
      
      console.log("✓");
      
      // Rate limit
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`✗ ${err.message}`);
      results.push({ ...test, gpt: `ERROR: ${err.message}`, claude: null });
    }
  }

  // Output results
  console.log("\n" + "=".repeat(60));
  console.log("RESULTS");
  console.log("=".repeat(60));

  for (const r of results) {
    console.log(`\n📦 ${r.brand} (${r.domain})`);
    console.log(`   Query: ${r.query}`);
    console.log(`   Truth: ${r.truth}`);
    console.log(`   GPT-4o: ${truncate(r.gpt)}`);
    if (r.claude) {
      console.log(`   Claude: ${truncate(r.claude)}`);
    }
  }

  // Save JSON for analysis
  const outputPath = './hallucination-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n\n💾 Full results saved to ${outputPath}`);

  // Summary prompt
  console.log("\n" + "=".repeat(60));
  console.log("MANUAL SCORING NEEDED");
  console.log("=".repeat(60));
  console.log(`
For each result, score as:
  ✓ CORRECT  - Price matches or is very close
  ✗ WRONG    - Confidently stated incorrect price  
  ? VAGUE    - Said "varies" or "check website"
  ○ REFUSED  - Said "I don't have current pricing info"

Then calculate:
  Hallucination Rate = WRONG / TOTAL
  Accuracy Rate = CORRECT / TOTAL
`);
}

runTests().catch(console.error);