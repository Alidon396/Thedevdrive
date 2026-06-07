#!/usr/bin/env node

/**
 * OpenRouter Client for Claude API
 * Handles website audits and content generation via Claude
 */

import axios from 'axios';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_KEY) {
  logger.error('Missing OPENROUTER_KEY in .env');
  process.exit(1);
}

/**
 * Call Claude API
 */
export async function callClaudeAPI(systemPrompt, userMessage, maxTokens = 2000) {
  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://thedevdrive-sahiwal.com',
          'X-Title': 'TheDevDrive Sahiwal',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      content: response.data.choices?.[0]?.message?.content,
      usage: response.data.usage,
      cost: (response.data.usage?.total_tokens || 0) * 0.00001, // Rough estimate in PKR
    };
  } catch (error) {
    logger.error(`Claude API error: ${error.response?.data?.error?.message || error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Audit website design
 */
export async function auditWebsiteDesign(businessName, businessType, websiteUrl) {
  const systemPrompt = `Aap ek web design expert ho jo Pakistan ke Sahiwal city mein small businesses ke websites ko analyze karte ho.
  
  Aapko JSON format mein ye return karna hai:
  {
    "design_score": 1-10,
    "mobile_score": 1-10,
    "speed_score": 1-10,
    "key_issue_urdu": "Roman Urdu mein sab se bada issue",
    "key_issue_english": "English mein",
    "revenue_impact_estimate": "alag alag rupees",
    "recommendations": ["suggestion 1", "suggestion 2"]
  }
  
  JSON ke siwaye kuch aur nahi likho.`;

  const userMessage = `Business: ${businessName}
Type: ${businessType}
Website: ${websiteUrl}

Is website ko analyze kar aur score de.`;

  const result = await callClaudeAPI(systemPrompt, userMessage);

  if (!result.success) {
    return null;
  }

  try {
    // Extract JSON from response
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('No JSON found in Claude response');
      return null;
    }

    const audit = JSON.parse(jsonMatch[0]);
    return {
      ...audit,
      api_cost_pkr: result.cost,
    };
  } catch (error) {
    logger.error(`Parse audit response error: ${error.message}`);
    return null;
  }
}

/**
 * Generate email copy
 */
export async function generateEmailCopy(businessName, businessType, issue, mockupUrl) {
  const systemPrompt = `Aap ek expert copywriter ho jo Pakistani Urdu mein persuasive emails likha.
  
  Reply karo sirf email body (subject nahi) - Roman Urdu mein.
  Concise, personal, aur conversion-focused.`;

  const userMessage = `Generate email for:
Business: ${businessName}
Type: ${businessType}
Main Issue: ${issue}
Mockup URL: ${mockupUrl}
Price: 15,000 PKR
Delivery: 7 days`;

  const result = await callClaudeAPI(systemPrompt, userMessage, 500);

  if (result.success) {
    return {
      body: result.content,
      cost: result.cost,
    };
  }

  return null;
}

/**
 * Generate call script
 */
export async function generateCallScript(businessName, issue, revenue_loss) {
  const systemPrompt = `Aap ek sales coach ho jo Cold calls ke liye scripts liktha.
  
  Script likho 2-3 minutes ke liye.
  Roman Urdu mein, conversational tone.
  Key points: Issue → Loss → Solution → Call to action.`;

  const userMessage = `Generate script for:
Business: ${businessName}
Main Issue: ${issue}
Monthly Loss: ${revenue_loss} PKR
Solution: Website redesign for 15K`;

  const result = await callClaudeAPI(systemPrompt, userMessage, 800);

  if (result.success) {
    return {
      script: result.content,
      cost: result.cost,
    };
  }

  return null;
}

/**
 * Batch API calls with rate limiting
 */
export async function batchClaudeRequests(requests, delayMs = 1000) {
  const results = [];
  
  for (let i = 0; i < requests.length; i++) {
    const { systemPrompt, userMessage, maxTokens } = requests[i];
    const result = await callClaudeAPI(systemPrompt, userMessage, maxTokens);
    results.push(result);
    
    if (i < requests.length - 1) {
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Estimate API costs
 */
export function estimateAPICost(operation, count) {
  const costs = {
    audit: 0.005,          // ~0.5 PKR per audit
    email: 0.002,          // ~0.2 PKR per email
    script: 0.003,         // ~0.3 PKR per script
    mockup: 0.0001,        // ~0.01 PKR per mockup
  };
  
  const costPerOperation = costs[operation] || 0.005;
  return costPerOperation * count;
}

export default {
  callClaudeAPI,
  auditWebsiteDesign,
  generateEmailCopy,
  generateCallScript,
  batchClaudeRequests,
  estimateAPICost,
};
