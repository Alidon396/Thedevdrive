#!/usr/bin/env node

/**
 * ============================================================================
 * AGENT 3: WEBSITE AUDITOR
 * ============================================================================
 * 
 * Analyzes business websites and finds problems
 * - Design score (1-10)
 * - Mobile responsiveness
 * - Key issues in Roman Urdu
 * - Revenue impact estimate
 * - Generates mockup URL
 * 
 * Output: 50+ audits generated per run
 * Cost: ~25-50 PKR (Claude API)
 * ============================================================================
 */

import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { getLeadsWithoutAudits, insertAudit, upsertDailyStats } from '../utils/supabase-client.js';
import { auditWebsiteDesign, estimateAPICost } from '../utils/openrouter-client.js';
import { delay, generateMockupURL, estimateMonthlyLoss } from '../utils/helpers.js';

dotenv.config();

const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://huggingface.co/spaces/YOUR_USERNAME/thedevdrive-sahiwal';

/**
 * Audit single website
 */
async function auditSingleWebsite(lead) {
  if (!lead.website_url) {
    logger.warn(`⏭️ Skip: ${lead.business_name} (no website)`);
    return null;
  }

  logger.info(`🔍 Auditing: ${lead.business_name} (${lead.business_type})`);

  try {
    // Call Claude for audit
    const auditResult = await auditWebsiteDesign(
      lead.business_name,
      lead.business_type,
      lead.website_url
    );

    if (!auditResult) {
      logger.warn(`⏭️ Audit failed: ${lead.business_name}`);
      return null;
    }

    // Generate mockup URL
    const mockupUrl = generateMockupURL(lead.id, HF_SPACE_URL);

    // Prepare audit data
    const auditData = {
      lead_id: lead.id,
      design_score: auditResult.design_score,
      mobile_score: auditResult.mobile_score,
      speed_score: auditResult.speed_score || 5,
      overall_score: Math.round(
        (auditResult.design_score + auditResult.mobile_score + (auditResult.speed_score || 5)) / 3
      ),
      key_issue_urdu: auditResult.key_issue_urdu,
      key_issue_english: auditResult.key_issue_english,
      revenue_impact_pkr: auditResult.revenue_impact_estimate || estimateMonthlyLoss(lead.business_type),
      recommendations: JSON.stringify(auditResult.recommendations || []),
      mockup_url: mockupUrl,
      mockup_generated_at: new Date().toISOString(),
      email_sent: false,
      whatsapp_sent: false,
    };

    // Insert into database
    const auditId = await insertAudit(auditData);
    if (auditId) {
      logger.info(`✅ Audit complete: ${lead.business_name} (Score: ${auditData.overall_score}/10)`);
      return auditData;
    }

    logger.error(`❌ Failed to save audit: ${lead.business_name}`);
    return null;
  } catch (error) {
    logger.error(`❌ Audit error for ${lead.business_name}: ${error.message}`);
    return null;
  }
}

/**
 * Batch audit websites
 */
async function batchAuditWebsites(limit = 50, delayMs = 2000) {
  logger.info(`📊 Starting batch audit (limit: ${limit})`);

  // Get leads without audits
  const leads = await getLeadsWithoutAudits(limit);
  logger.info(`Found ${leads.length} leads to audit`);

  if (leads.length === 0) {
    logger.info('✅ All leads already audited!');
    return 0;
  }

  let auditsCompleted = 0;
  let totalCost = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];

    const auditResult = await auditSingleWebsite(lead);
    if (auditResult) {
      auditsCompleted++;
      totalCost += 0.005; // Approximate cost per audit
    }

    // Rate limiting
    if (i < leads.length - 1) {
      await delay(delayMs);
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      logger.info(`Progress: ${i + 1}/${leads.length} audited`);
    }
  }

  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  await upsertDailyStats({
    stat_date: today,
    audits_generated: auditsCompleted,
    api_cost_pkr: Math.round(totalCost),
    updated_at: new Date().toISOString(),
  });

  return auditsCompleted;
}

/**
 * Main workflow
 */
async function main() {
  logger.section('AGENT 3: WEBSITE AUDITOR');
  logger.info('Starting website audit process...\n');

  try {
    const auditsCompleted = await batchAuditWebsites(50, 2000);

    logger.section('AUDIT COMPLETE');
    logger.info(`✅ Total audits: ${auditsCompleted}`);
    logger.info(`💰 Estimated cost: ~${Math.round(auditsCompleted * 0.5)} PKR`);
    logger.info(`⏭️ Next step: Generate mockups and send emails`);

    process.exit(0);
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { auditSingleWebsite, batchAuditWebsites };
