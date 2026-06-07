#!/usr/bin/env node

/**
 * ============================================================================
 * AGENT 1: LEAD SCRAPER
 * ============================================================================
 * 
 * What it does:
 * - Finds all businesses in Sahiwal using Google Maps API
 * - Extracts: name, owner, phone, website, address, rating
 * - Filters by business type (restaurant, gym, dental, medical, education)
 * - Stores in Supabase database
 * - Runs every 12 hours automatically
 * 
 * Output Day 1: 500+ leads in database
 * 
 * Cost: ~50 PKR (Google Maps API free tier: 100 calls/day)
 * ============================================================================
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { delay, deduplicateLeads } from '../utils/helpers.js';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;

// Business types to scrape
const BUSINESS_TYPES = {
  restaurant: {
    urdu: 'Restaurant/Khana Ghar',
    queries: ['Restaurant in Sahiwal', 'Fast food Sahiwal', 'Cafe Sahiwal'],
    count: 70
  },
  gym: {
    urdu: 'Fitness Center',
    queries: ['Gym in Sahiwal', 'Fitness center Sahiwal', 'CrossFit Sahiwal'],
    count: 30
  },
  dental: {
    urdu: 'Dental Clinic',
    queries: ['Dental clinic Sahiwal', 'Dentist Sahiwal', 'Orthodontist Sahiwal'],
    count: 25
  },
  medical: {
    urdu: 'Medical Clinic',
    queries: ['Doctor clinic Sahiwal', 'Medical clinic Sahiwal', 'Hospital Sahiwal'],
    count: 40
  },
  education: {
    urdu: 'Coaching Center',
    queries: ['Coaching center Sahiwal', 'Driving school Sahiwal', 'Tuition center Sahiwal'],
    count: 20
  }
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// GOOGLE MAPS SCRAPER
// ============================================================================

async function searchGoogleMaps(query) {
  /**
   * Search Google Maps Text Search API for businesses
   * Returns: Array of places with name, phone, website, rating
   */
  try {
    logger.info(`🔍 Searching: "${query}"`);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: query,
        key: GOOGLE_MAPS_KEY,
        region: 'pk', // Pakistan
      },
      timeout: 10000
    });

    if (response.data.status !== 'OK') {
      logger.warn(`⚠️ API Error: ${response.data.status}`);
      return [];
    }

    const places = response.data.results || [];
    logger.info(`✅ Found ${places.length} places for: "${query}"`);

    return places.map(place => ({
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating || 0,
      place_id: place.place_id,
      types: place.types || [],
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      opening_hours: place.opening_hours?.open_now,
      formatted_phone: place.formatted_phone_number || null,
      website: place.website || null,
    }));
  } catch (error) {
    logger.error(`❌ Google Maps Error: ${error.message}`);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  /**
   * Get detailed information about a specific place
   * Includes phone number and website URL
   */
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_phone_number,website,formatted_address,rating,international_phone_number',
        key: GOOGLE_MAPS_KEY,
      },
      timeout: 10000
    });

    if (response.data.status !== 'OK') {
      return null;
    }

    const result = response.data.result;
    return {
      phone: result.international_phone_number || result.formatted_phone_number,
      website: result.website,
    };
  } catch (error) {
    logger.error(`❌ Place Details Error: ${error.message}`);
    return null;
  }
}

// ============================================================================
// LEAD EXTRACTION & VALIDATION
// ============================================================================

function validatePhoneNumber(phone) {
  /**
   * Validate and format Pakistani phone numbers
   * Formats: +92-3XX-XXXXXXX or +92XXXXXXXXX
   */
  if (!phone) return null;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Pakistan phone format validation
  // Either 92-followed by 10 digits (92 = Pakistan country code)
  // Or starts with 0 and has 11 digits (local format)
  if (digits.startsWith('92')) {
    if (digits.length === 12) {
      return `+${digits}`;
    }
  } else if (digits.startsWith('0')) {
    if (digits.length === 11) {
      return `+92${digits.substring(1)}`;
    }
  }

  return null;
}

function extractAreaName(address) {
  /**
   * Extract Sahiwal area from address
   * Examples: Garden Road, Medical Area, Canal Road, etc.
   */
  const areas = [
    'Garden Road',
    'Medical Area',
    'Doctors Road',
    'University Road',
    'Canal Road',
    'Khanpur Road',
    'Chak Road',
    'Adiala Road',
    'Mall Road',
    'Opposite Mall',
  ];

  const addressLower = address.toLowerCase();
  for (const area of areas) {
    if (addressLower.includes(area.toLowerCase())) {
      return area;
    }
  }

  return 'Other'; // Default area
}

function extractOwnerName(businessName) {
  /**
   * Try to extract owner name from business name
   * Heuristic: If format is "[Name] [Business Type]", extract name
   * Example: "Ahmed Restaurant" → "Ahmed"
   */
  const businessPatterns = [
    'restaurant', 'khana', 'hotel', 'cafe', 'dhabha',
    'gym', 'fitness', 'crossfit',
    'clinic', 'dental', 'doctor', 'medical', 'hospital',
    'coaching', 'tuition', 'center', 'academy', 'school', 'institute'
  ];

  const parts = businessName.split(' ');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (businessPatterns.some(pattern => lastPart.includes(pattern))) {
      return parts.slice(0, -1).join(' ');
    }
  }

  return null;
}

// ============================================================================
// LEAD STORAGE & DEDUPLICATION
// ============================================================================

async function isLeadExists(phone) {
  /**
   * Check if lead with phone number already exists
   */
  if (!phone) return false;

  const { data, error } = await supabase
    .from('leads')
    .select('id')
    .eq('phone', phone)
    .limit(1);

  if (error) {
    logger.error(`❌ DB Error checking lead: ${error.message}`);
    return false;
  }

  return data && data.length > 0;
}

async function insertLead(leadData) {
  /**
   * Insert lead into Supabase
   * Returns: lead ID on success, null on failure
   */
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select('id');

    if (error) {
      logger.error(`❌ Error inserting lead: ${error.message}`);
      return null;
    }

    logger.info(`✅ Lead inserted: ${leadData.business_name} (${leadData.phone})`);
    return data?.[0]?.id;
  } catch (error) {
    logger.error(`❌ Unexpected error inserting lead: ${error.message}`);
    return null;
  }
}

// ============================================================================
// MAIN SCRAPING WORKFLOW
// ============================================================================

async function scrapeBusinessType(businessType, businessConfig) {
  /**
   * Scrape all businesses for a specific type
   * Returns: Array of inserted lead IDs
   */
  logger.info(`\n📍 SCRAPING: ${businessType.toUpperCase()}`);
  logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  let leadsAdded = 0;
  let leadsSkipped = 0;
  const allPlaces = [];

  // Search for each query
  for (const query of businessConfig.queries) {
    const places = await searchGoogleMaps(query);
    allPlaces.push(...places);

    // Google Maps API rate limiting: 1 request per second
    await delay(1000);
  }

  // Deduplicate by place_id
  const uniquePlaces = deduplicateLeads(allPlaces, 'place_id');
  logger.info(`Found ${uniquePlaces.length} unique places`);

  // Filter by rating (Sahiwal has lower ratings, so minimum 3.0)
  const filteredPlaces = uniquePlaces.filter(place => place.rating >= 3.0);
  logger.info(`Filtered to ${filteredPlaces.length} places with rating >= 3.0`);

  // Process each place
  for (let i = 0; i < Math.min(filteredPlaces.length, businessConfig.count); i++) {
    const place = filteredPlaces[i];

    // Get detailed information
    const details = await getPlaceDetails(place.place_id);
    await delay(500); // Rate limiting

    if (!details || !details.phone) {
      logger.warn(`⏭️ Skip: ${place.name} (no phone)`);
      leadsSkipped++;
      continue;
    }

    // Validate phone
    const validPhone = validatePhoneNumber(details.phone);
    if (!validPhone) {
      logger.warn(`⏭️ Skip: ${place.name} (invalid phone format)`);
      leadsSkipped++;
      continue;
    }

    // Check if already exists
    const exists = await isLeadExists(validPhone);
    if (exists) {
      logger.warn(`⏭️ Skip: ${place.name} (already in database)`);
      leadsSkipped++;
      continue;
    }

    // Extract owner name
    const ownerName = extractOwnerName(place.name);
    const area = extractAreaName(place.formatted_address);

    // Calculate business score (1-100)
    let score = 50;
    if (place.rating >= 4.5) score += 20;
    else if (place.rating >= 4.0) score += 15;
    else if (place.rating >= 3.5) score += 10;

    // Prepare lead data
    const leadData = {
      business_type: businessType,
      business_name: place.name,
      owner_name: ownerName,
      phone: validPhone,
      website_url: details.website,
      address: place.formatted_address,
      city: 'Sahiwal',
      area: area,
      business_score: score,
      status: 'new',
    };

    // Insert lead
    const leadId = await insertLead(leadData);
    if (leadId) {
      leadsAdded++;
    } else {
      leadsSkipped++;
    }

    // Rate limiting: 1 insert per 100ms
    await delay(100);
  }

  logger.info(`\n✅ Results for ${businessType}:`);
  logger.info(`  Added: ${leadsAdded}`);
  logger.info(`  Skipped: ${leadsSkipped}`);

  return leadsAdded;
}

async function updateDailyStats(totalLeadsScraped) {
  /**
   * Update daily_stats table with scraping results
   */
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get current lead count
    const { data: allLeads } = await supabase
      .from('leads')
      .select('id');

    const totalLeads = allLeads?.length || 0;

    await supabase
      .from('daily_stats')
      .upsert({
        stat_date: today,
        leads_scraped: totalLeadsScraped,
        leads_total: totalLeads,
        updated_at: new Date().toISOString(),
      });

    logger.info(`📊 Daily stats updated`);
  } catch (error) {
    logger.error(`❌ Error updating daily stats: ${error.message}`);
  }
}

async function main() {
  /**
   * Main workflow: Scrape all business types
   */
  logger.info(`\n╔════════════════════════════════════════════════════════╗`);
  logger.info(`║  AGENT 1: LEAD SCRAPER - TheDevDrive Sahiwal         ║`);
  logger.info(`║  Scraping Google Maps for Sahiwal businesses         ║`);
  logger.info(`╚════════════════════════════════════════════════════════╝\n`);

  let totalLeadsAdded = 0;

  // Scrape each business type
  for (const [businessType, config] of Object.entries(BUSINESS_TYPES)) {
    const leadsAdded = await scrapeBusinessType(businessType, config);
    totalLeadsAdded += leadsAdded;
  }

  // Update daily stats
  await updateDailyStats(totalLeadsAdded);

  logger.info(`\n╔════════════════════════════════════════════════════════╗`);
  logger.info(`║  SCRAPING COMPLETE                                   ║`);
  logger.info(`║  Total leads added: ${totalLeadsAdded.toString().padEnd(34)} ║`);
  logger.info(`║  Next step: Run Agent 3 (Website Auditor)            ║`);
  logger.info(`╚════════════════════════════════════════════════════════╝\n`);

  process.exit(0);
}

// ============================================================================
// RUN AGENT
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error(`❌ Fatal Error: ${error.message}`);
    process.exit(1);
  });
}

export { scrapeBusinessType, searchGoogleMaps, getPlaceDetails };
