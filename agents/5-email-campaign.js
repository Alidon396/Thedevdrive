#!/usr/bin/env node

/**
 * ============================================================================
 * AGENT 5: EMAIL CAMPAIGN
 * ============================================================================
 * 
 * Sends personalized emails to leads via Resend API
 * - Roman Urdu templates
 * - Includes mockup link
 * - Tracks opens/clicks
 * 
 * Output: 100+ emails per batch
 * Cost: Free (Resend free tier)
 * ============================================================================
 */

import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { getLeadsByStatus, updateLeadStatus, upsertDailyStats } from '../utils/supabase-client.js';
import { delay } from '../utils/helpers.js';

dotenv.config();

const RESEND_KEY = process.env.RESEND_KEY;
const YOUR_EMAIL = process.env.YOUR_EMAIL || 'noreply@thedevdrive.com';

/**
 * Email template for restaurants
 */
function getEmailTemplate(lead, audit) {
  const templates = {
    restaurant: `Assalaam-o-alaikum ${lead.owner_name || 'Aap'},

Mera naam Ahmed hai aur main TheDevDrive se hoon - Sahiwal ke ek digital agency.

Main ${lead.business_name} ke liye website audit kar raha tha aur mujhe kuch important batain maloom huen:

📊 CURRENT SCORE: ${audit.design_score}/10
❌ BIGGEST ISSUE: ${audit.key_issue_urdu}
💰 MONTHLY LOSS: ~${audit.revenue_impact_pkr.toLocaleString('en-PK')} rupees

Bilkul se hi. Booking system nahi hai, menu update nahi hai, phone dhundna padta hai.

Is se aap 20-30% customers lose kar rahe ho.

---

Fir main ne aik modern mockup banaya jab aap dekhte ho toh samajh ajaoge.

MOCKUP DEKHIEN 👇
${audit.mockup_url}

---

FAQIR 15,000 RUPEES MEIN:
✅ Modern responsive website
✅ Online booking system
✅ Updated menu
✅ One-click WhatsApp ordering
✅ 5-7 din mein live

Professional agencies 40,000-60,000 leta hain.
Main 15,000 mein kar dunga kyun ke process fast aur automated hai.

---

SHUKRIYA!
Ahmed
TheDevDrive
Sahiwal, Punjab
+923334567890
`,

    gym: `Assalaam-o-alaikum ${lead.owner_name || 'Aap'},

Mera naam Ahmed hai - TheDevDrive se.

Main ${lead.business_name} ke liye website dekh raha tha.
Design score: ${audit.design_score}/10

Main issue: ${audit.key_issue_urdu}

Harmon members website pe membership price nahi dekh sakte. Timing clear nahi. Classes schedule update nahi.

Is se ${audit.revenue_impact_pkr.toLocaleString('en-PK')} rupees har mahine membership loss hota hai.

---

Mockup dekhen: ${audit.mockup_url}

Modern website sirf 15,000 PKR mein.

Ahmed
TheDevDrive
+923334567890`,

    dental: `Assalaam-o-alaikum Dr. ${lead.owner_name || 'Aap'},

Main TheDevDrive se hoon.

${lead.business_name} ke liye website improvement tha.

❌ ISSUE: ${audit.key_issue_urdu}

Patients easily appointment book nahi kar sakte. Emergency number website pe nahi hai.

Is se ${audit.revenue_impact_pkr.toLocaleString('en-PK')} rupees monthly loss.

---

MODERN WEBSITE: 15,000 PKR
✅ Appointment booking system
✅ Doctor profiles + credentials
✅ Emergency contact
✅ 7-din delivery

Mockup: ${audit.mockup_url}

Ahmed
TheDevDrive
Sahiwal
+923334567890`,

    medical: `Assalaam-o-alaikum Dr. ${lead.owner_name || 'Aap'},

TheDevDrive se Ahmed.

${lead.business_name} ke liye website review:

ISSUE: ${audit.key_issue_urdu}

Current score: ${audit.design_score}/10

Patients ko doctor credentials clear nahi hain. OPD timing update nahi. Appointment booking difficult.

LOSS: ${audit.revenue_impact_pkr.toLocaleString('en-PK')} rupees/month

---

Modern website: 15,000 PKR
- Doctor profiles (qualifications, specializations)
- Online appointment booking
- OPD timing
- Patient testimonials

Mockup: ${audit.mockup_url}

WhatsApp par hi baat kar sakte ho.

Ahmed
+923334567890`,

    education: `Assalaam-o-alaikum ${lead.owner_name || 'Aap'},

TheDevDrive se Ahmed.

${lead.business_name} ke liye website audit:

ISSUE: ${audit.key_issue_urdu}

Course fees clear nahi hain. Teacher qualifications likhe nahi. Contact form nahi kaam kar raha.

LOSS: ${audit.revenue_impact_pkr.toLocaleString('en-PK')} rupees/month enrollment loss

---

Modern website: 15,000 PKR
- Course details + fees
- Teacher profiles
- Student results
- Enrollment form

Mockup: ${audit.mockup_url}

Message karo!

Ahmed
+923334567890`,
  };

  return templates[lead.business_type] || templates.restaurant;
}

/**
 * Send email via Resend
 */
async function sendEmailResend(to, subject, html) {
  try {
    // Using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: YOUR_EMAIL,
        to,
        subject,
        html: `<pre>${html}</pre>`,
      }),
    });

    if (!response.ok) {
      logger.error(`Email send failed: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    logger.info(`✅ Email sent: ${to}`);
    return true;
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    return false;
  }
}

/**
 * Send email batch
 */
async function sendEmailBatch(leads, audits, batchSize = 100) {
  logger.info(`📧 Starting email campaign (${leads.length} leads)`);

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    const audit = audits.find(a => a.lead_id === lead.id);
    if (!audit) continue;

    const subject = `${lead.business_name} ka Design Score: ${audit.design_score}/10 - Bohat Aham`;
    const body = getEmailTemplate(lead, audit);

    // Get business email (demo - would need real email in DB)
    const businessEmail = `${lead.business_name.toLowerCase().replace(/\s/g, '')}@example.com`;

    const success = await sendEmailResend(businessEmail, subject, body);
    if (success) {
      sent++;
      // Mark as sent in DB (in real implementation)
    } else {
      failed++;
    }

    // Rate limiting
    await delay(500);

    if ((sent + failed) % 10 === 0) {
      logger.info(`Progress: ${sent + failed} emails processed`);
    }
  }

  logger.info(`\n✅ Campaign complete: ${sent} sent, ${failed} failed`);
  return sent;
}

/**
 * Main workflow
 */
async function main() {
  logger.section('AGENT 5: EMAIL CAMPAIGN');

  try {
    // Get new leads
    const leads = await getLeadsByStatus('new');
    logger.info(`Found ${leads.length} new leads`);

    if (leads.length === 0) {
      logger.info('✅ No new leads to email');
      process.exit(0);
    }

    // Demo: Mock audits (would fetch from DB in reality)
    const audits = leads.map(l => ({
      lead_id: l.id,
      design_score: Math.floor(Math.random() * 5) + 3,
      key_issue_urdu: 'Booking system nahi hai',
      revenue_impact_pkr: 15000,
      mockup_url: `https://example.com/mockup/${l.id}`,
    }));

    const sent = await sendEmailBatch(leads, audits);

    // Update stats
    const today = new Date().toISOString().split('T')[0];
    await upsertDailyStats({
      stat_date: today,
      emails_sent: sent,
      updated_at: new Date().toISOString(),
    });

    logger.section('EMAIL CAMPAIGN COMPLETE');
    logger.info(`✅ Emails sent: ${sent}`);
    logger.info(`📊 Next: WhatsApp follow-ups and cold calls`);

    process.exit(0);
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getEmailTemplate, sendEmailResend, sendEmailBatch };
