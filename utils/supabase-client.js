#!/usr/bin/env node

/**
 * Supabase Database Client
 * Connection pool, error handling, and query utilities
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  logger.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Get Supabase client
 */
export function getSupabaseClient() {
  return supabase;
}

/**
 * Insert single lead
 */
export async function insertLead(leadData) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select('id');

    if (error) {
      logger.error(`Insert lead error: ${error.message}`);
      return null;
    }

    return data?.[0]?.id;
  } catch (error) {
    logger.error(`Unexpected insert error: ${error.message}`);
    return null;
  }
}

/**
 * Batch insert leads
 */
export async function insertLeads(leadsData) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsData)
      .select('id');

    if (error) {
      logger.error(`Batch insert error: ${error.message}`);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error(`Unexpected batch insert error: ${error.message}`);
    return [];
  }
}

/**
 * Check if lead exists by phone
 */
export async function leadExists(phone) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .limit(1);

    if (error) {
      logger.error(`Check lead error: ${error.message}`);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    logger.error(`Unexpected check error: ${error.message}`);
    return false;
  }
}

/**
 * Get all leads by status
 */
export async function getLeadsByStatus(status) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Get leads error: ${error.message}`);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error(`Unexpected get error: ${error.message}`);
    return [];
  }
}

/**
 * Get leads without audits
 */
export async function getLeadsWithoutAudits(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, business_name, business_type, website_url')
      .not('id', 'in', '(SELECT lead_id FROM audits)')
      .limit(limit);

    if (error) {
      logger.error(`Get leads without audits error: ${error.message}`);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
    return [];
  }
}

/**
 * Insert audit
 */
export async function insertAudit(auditData) {
  try {
    const { data, error } = await supabase
      .from('audits')
      .insert([auditData])
      .select('id');

    if (error) {
      logger.error(`Insert audit error: ${error.message}`);
      return null;
    }

    return data?.[0]?.id;
  } catch (error) {
    logger.error(`Unexpected insert audit error: ${error.message}`);
    return null;
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId, status) {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId);

    if (error) {
      logger.error(`Update lead status error: ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error(`Unexpected update error: ${error.message}`);
    return false;
  }
}

/**
 * Insert call record
 */
export async function insertCall(callData) {
  try {
    const { data, error } = await supabase
      .from('calls')
      .insert([callData])
      .select('id');

    if (error) {
      logger.error(`Insert call error: ${error.message}`);
      return null;
    }

    return data?.[0]?.id;
  } catch (error) {
    logger.error(`Unexpected insert call error: ${error.message}`);
    return null;
  }
}

/**
 * Insert close record
 */
export async function insertClose(closeData) {
  try {
    const { data, error } = await supabase
      .from('closes')
      .insert([closeData])
      .select('id');

    if (error) {
      logger.error(`Insert close error: ${error.message}`);
      return null;
    }

    return data?.[0]?.id;
  } catch (error) {
    logger.error(`Unexpected insert close error: ${error.message}`);
    return null;
  }
}

/**
 * Get today's stats
 */
export async function getTodayStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('stat_date', today)
      .limit(1);

    if (error) {
      logger.error(`Get stats error: ${error.message}`);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    logger.error(`Unexpected get stats error: ${error.message}`);
    return null;
  }
}

/**
 * Upsert daily stats
 */
export async function upsertDailyStats(statsData) {
  try {
    const { error } = await supabase
      .from('daily_stats')
      .upsert([statsData]);

    if (error) {
      logger.error(`Upsert stats error: ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error(`Unexpected upsert stats error: ${error.message}`);
    return false;
  }
}

/**
 * Get lead count by type
 */
export async function getLeadCountByType(businessType) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id', { count: 'exact' })
      .eq('business_type', businessType);

    if (error) {
      logger.error(`Count leads error: ${error.message}`);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    logger.error(`Unexpected count error: ${error.message}`);
    return 0;
  }
}

/**
 * Get total leads
 */
export async function getTotalLeads() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id', { count: 'exact' });

    if (error) {
      logger.error(`Total leads error: ${error.message}`);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
    return 0;
  }
}

/**
 * Get conversion metrics
 */
export async function getConversionMetrics() {
  try {
    const [totalLeads, audited, contacted, demos, closes] = await Promise.all([
      getTotalLeads(),
      (async () => {
        const { data } = await supabase.from('audits').select('id', { count: 'exact' });
        return data?.length || 0;
      })(),
      (async () => {
        const { data } = await supabase.from('leads').select('id', { count: 'exact' }).eq('status', 'contacted');
        return data?.length || 0;
      })(),
      (async () => {
        const { data } = await supabase.from('calls').select('id', { count: 'exact' }).eq('demo_booked', true);
        return data?.length || 0;
      })(),
      (async () => {
        const { data } = await supabase.from('closes').select('id', { count: 'exact' }).eq('payment_received', true);
        return data?.length || 0;
      })(),
    ]);

    return {
      totalLeads,
      audited,
      contacted,
      demos,
      closes,
      auditRate: totalLeads > 0 ? ((audited / totalLeads) * 100).toFixed(1) : 0,
      contactRate: audited > 0 ? ((contacted / audited) * 100).toFixed(1) : 0,
      demoRate: demos > 0 ? ((closes / demos) * 100).toFixed(1) : 0,
    };
  } catch (error) {
    logger.error(`Conversion metrics error: ${error.message}`);
    return null;
  }
}

export default supabase;
