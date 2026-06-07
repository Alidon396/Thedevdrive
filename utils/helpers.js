#!/usr/bin/env node

/**
 * Helper utilities for all agents
 * Common functions: delay, deduplication, formatting, etc.
 */

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deduplicate array of objects by property
 * @param {Array} array - Array to deduplicate
 * @param {string} property - Property to deduplicate by
 */
export function deduplicateLeads(array, property) {
  const seen = new Set();
  return array.filter(item => {
    const value = item[property];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Format price in PKR
 * @param {number} amount - Amount in rupees
 */
export function formatPKR(amount) {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

/**
 * Format phone number to Pakistani standard
 * @param {string} phone - Phone number to format
 */
export function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('92')) {
    return `+${digits}`;
  } else if (digits.startsWith('0')) {
    return `+92${digits.substring(1)}`;
  }
  return null;
}

/**
 * Generate Roman Urdu WhatsApp link
 * @param {string} phone - Phone number
 * @param {string} message - Message text
 */
export function generateWhatsAppLink(phone, message) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`;
}

/**
 * Calculate business score (1-100)
 * @param {number} rating - Rating from Google Maps
 * @param {string} businessType - Type of business
 */
export function calculateBusinessScore(rating, businessType) {
  let score = 50;
  
  // Rating bonus
  if (rating >= 4.5) score += 20;
  else if (rating >= 4.0) score += 15;
  else if (rating >= 3.5) score += 10;
  else if (rating >= 3.0) score += 5;
  
  // Business type multiplier (medical has higher score)
  const multipliers = {
    medical: 1.2,
    dental: 1.15,
    restaurant: 1.0,
    gym: 0.95,
    education: 0.9,
  };
  
  score *= multipliers[businessType] || 1.0;
  return Math.min(100, Math.round(score));
}

/**
 * Extract Sahiwal area from address
 * @param {string} address - Full address
 */
export function extractAreaName(address) {
  if (!address) return 'Other';
  
  const areas = [
    'Garden Road', 'Medical Area', 'Doctors Road', 'University Road',
    'Canal Road', 'Khanpur Road', 'Chak Road', 'Adiala Road',
    'Mall Road', 'Opposite Mall', 'Chungi Road'
  ];
  
  const addressLower = address.toLowerCase();
  for (const area of areas) {
    if (addressLower.includes(area.toLowerCase())) {
      return area;
    }
  }
  
  return 'Other';
}

/**
 * Extract owner name from business name
 * @param {string} businessName - Business name
 */
export function extractOwnerName(businessName) {
  if (!businessName) return null;
  
  const patterns = [
    'restaurant', 'khana', 'hotel', 'cafe', 'dhabha',
    'gym', 'fitness', 'crossfit', 'clinic', 'dental',
    'doctor', 'medical', 'hospital', 'coaching', 'tuition',
    'center', 'academy', 'school', 'institute'
  ];
  
  const parts = businessName.split(' ');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (patterns.some(p => lastPart.includes(p))) {
      return parts.slice(0, -1).join(' ');
    }
  }
  
  return null;
}

/**
 * Generate mockup URL
 * @param {number} leadId - Lead ID
 * @param {string} hfSpace - HF Space URL
 */
export function generateMockupURL(leadId, hfSpace) {
  const baseUrl = hfSpace || 'https://huggingface.co/spaces/YOUR_USERNAME/thedevdrive-sahiwal';
  return `${baseUrl}/mockup/${leadId}`;
}

/**
 * Estimate monthly revenue loss
 * @param {string} businessType - Type of business
 */
export function estimateMonthlyLoss(businessType) {
  const estimates = {
    restaurant: 15000,      // ~3-5 reservations × 3000-5000 PKR
    gym: 20000,            // ~2-3 memberships × 7000-10000 PKR
    dental: 18000,         // ~4-6 appointments × 3000 PKR
    medical: 25000,        // ~5-10 patients × 2500-5000 PKR
    education: 12000,      // ~2-3 enrollments × 4000-6000 PKR
  };
  
  return estimates[businessType] || 15000;
}

/**
 * Generate call script in Roman Urdu
 * @param {Object} lead - Lead data
 * @param {Object} audit - Audit data
 */
export function generateCallScript(lead, audit) {
  const ownerName = lead.owner_name || 'Aap';
  const businessName = lead.business_name;
  const issue = audit.key_issue_urdu || 'Design issue';
  const loss = audit.revenue_impact_pkr || 15000;
  
  return `
Assalaam-o-alaikum! Mera naam Ahmed hai aur main TheDevDrive se hoon Sahiwal se.

Main ${businessName} ke liye website audit kar raha tha.
Aapka design score ${audit.design_score}/10 tha.

Sab se bada masla ye tha: ${issue}

Is se aap har mahine ${loss.toLocaleString('en-PK')} rupees ka loss kar rahe ho.

Main aapke liye aik modern mockup banaya hoon.
Sirf 15,000 rupees mein poora website redesign kar dunga.
5-7 din mein live kara dunga.

Kya main aapko WhatsApp par mockup link bhej duun?
  `;
}

/**
 * Validate business type
 * @param {string} type - Business type
 */
export function isValidBusinessType(type) {
  const validTypes = ['restaurant', 'gym', 'dental', 'medical', 'education'];
  return validTypes.includes(type?.toLowerCase());
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Max retries
 * @param {number} delayMs - Initial delay
 */
export async function retryWithBackoff(fn, maxRetries = 3, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(delayMs * Math.pow(2, i));
    }
  }
}

/**
 * Batch array into chunks
 * @param {Array} array - Array to batch
 * @param {number} size - Batch size
 */
export function batchArray(array, size) {
  const batches = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

/**
 * Convert to Roman Urdu (basic phonetic transcription)
 * @param {string} text - Text to convert
 */
export function toRomanUrdu(text) {
  // Basic mapping - real implementation would be more complex
  const mapping = {
    'hello': 'Assalaam-o-alaikum',
    'yes': 'Haan',
    'no': 'Nahi',
    'thank you': 'Shukriya',
    'thank': 'Shukr',
  };
  
  return mapping[text.toLowerCase()] || text;
}
