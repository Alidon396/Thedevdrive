-- ============================================================================
-- TheDevDrive Sahiwal - Complete Supabase Schema
-- Copy-paste this entire file into Supabase SQL Editor and run
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. LEADS TABLE - All business contacts from Sahiwal
-- ============================================================================
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  business_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  
  -- Business Info
  business_type VARCHAR(50), -- 'restaurant', 'gym', 'dental', 'medical', 'education'
  business_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  phone VARCHAR(20), -- +92-3XX-XXXXXXX format
  website_url VARCHAR(500),
  address VARCHAR(500),
  city VARCHAR(50) DEFAULT 'Sahiwal',
  area VARCHAR(100), -- Garden Road, Medical Area, etc
  
  -- Qualification Score (1-100)
  business_score INTEGER DEFAULT 50, -- Likelihood to buy
  
  -- Status
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, closed, rejected
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  scraped_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_business_type ON leads(business_type);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_phone ON leads(phone);

-- ============================================================================
-- 2. AUDITS TABLE - Website analysis results
-- ============================================================================
CREATE TABLE audits (
  id SERIAL PRIMARY KEY,
  audit_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Audit Scores
  design_score INTEGER, -- 1-10
  mobile_score INTEGER, -- 1-10
  speed_score INTEGER, -- 1-10
  overall_score INTEGER, -- 1-10
  
  -- Analysis Results (Urdu + English)
  key_issue_urdu VARCHAR(255),
  key_issue_english VARCHAR(255),
  recommendations TEXT, -- JSON array of suggestions
  revenue_impact_pkr INTEGER, -- Monthly loss estimate
  
  -- Current Website
  current_website_title VARCHAR(500),
  current_website_description TEXT,
  has_booking_system BOOLEAN DEFAULT FALSE,
  has_contact_form BOOLEAN DEFAULT FALSE,
  has_appointment_system BOOLEAN DEFAULT FALSE,
  
  -- Outreach Status
  mockup_url VARCHAR(500),
  mockup_generated_at TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  whatsapp_sent_at TIMESTAMP,
  whatsapp_replied BOOLEAN DEFAULT FALSE,
  whatsapp_reply_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audits_lead_id ON audits(lead_id);
CREATE INDEX idx_audits_status ON audits(email_sent, whatsapp_sent);
CREATE INDEX idx_audits_score ON audits(overall_score);

-- ============================================================================
-- 3. CALLS TABLE - Phone call tracking
-- ============================================================================
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  call_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Call Details
  call_date TIMESTAMP DEFAULT NOW(),
  call_duration INTEGER, -- seconds
  call_status VARCHAR(50), -- 'connected', 'voicemail', 'rejected', 'busy'
  
  -- Outcome
  demo_booked BOOLEAN DEFAULT FALSE,
  demo_date TIMESTAMP,
  demo_link VARCHAR(500), -- Zoom link
  
  -- Objection Handling
  objection VARCHAR(255), -- "Too expensive", "Not interested", etc
  objection_urdu VARCHAR(255), -- Roman Urdu version
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  
  -- Notes & Actions
  call_notes TEXT,
  next_action VARCHAR(255), -- What to do next
  next_follow_up_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_demo_booked ON calls(demo_booked);
CREATE INDEX idx_calls_date ON calls(call_date);

-- ============================================================================
-- 4. CLOSES TABLE - Deals won
-- ============================================================================
CREATE TABLE closes (
  id SERIAL PRIMARY KEY,
  close_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  call_id INTEGER REFERENCES calls(id),
  
  -- Deal Details
  package_type VARCHAR(50), -- 'standard', 'premium', 'elite'
  amount_pkr INTEGER NOT NULL,
  
  -- Payment Status
  payment_method VARCHAR(50), -- 'jazzcash', 'easypaisa', 'bank', 'cash'
  payment_received BOOLEAN DEFAULT FALSE,
  payment_received_at TIMESTAMP,
  payment_screenshot_url VARCHAR(500),
  
  -- Project Status
  project_status VARCHAR(50) DEFAULT 'new', -- new, in_progress, completed, delivered
  delivery_date DATE,
  delivery_url VARCHAR(500), -- New website URL
  delivered_at TIMESTAMP,
  
  -- Timestamps
  closed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_closes_lead_id ON closes(lead_id);
CREATE INDEX idx_closes_payment_received ON closes(payment_received);
CREATE INDEX idx_closes_project_status ON closes(project_status);

-- ============================================================================
-- 5. DAILY STATS TABLE - Analytics & Reporting
-- ============================================================================
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  stat_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  
  -- Collection
  leads_scraped INTEGER DEFAULT 0,
  leads_total INTEGER DEFAULT 0,
  
  -- Analysis
  audits_generated INTEGER DEFAULT 0,
  audits_total INTEGER DEFAULT 0,
  avg_design_score NUMERIC(3,1),
  
  -- Outreach
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  whatsapp_sent INTEGER DEFAULT 0,
  whatsapp_replied INTEGER DEFAULT 0,
  
  -- Sales
  calls_made INTEGER DEFAULT 0,
  calls_connected INTEGER DEFAULT 0,
  demos_booked INTEGER DEFAULT 0,
  closes INTEGER DEFAULT 0,
  
  -- Revenue
  revenue_pkr INTEGER DEFAULT 0,
  revenue_total INTEGER DEFAULT 0,
  
  -- Costs
  api_cost_pkr INTEGER DEFAULT 0,
  
  -- Funnel
  conversion_rate NUMERIC(5,2),
  email_open_rate NUMERIC(5,2),
  call_connect_rate NUMERIC(5,2),
  demo_close_rate NUMERIC(5,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 6. TEMPLATES TABLE - Email & WhatsApp templates
-- ============================================================================
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  template_type VARCHAR(50), -- 'email', 'whatsapp', 'sms'
  template_name VARCHAR(255),
  language VARCHAR(20) DEFAULT 'urdu-roman', -- 'urdu-roman', 'english', 'urdu'
  
  subject VARCHAR(500), -- For emails
  body TEXT NOT NULL,
  variables TEXT, -- JSON array of variable names
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 7. MOCKUPS TABLE - Website mockup tracking
-- ============================================================================
CREATE TABLE mockups (
  id SERIAL PRIMARY KEY,
  mockup_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  
  business_name VARCHAR(255),
  business_type VARCHAR(50),
  current_design_score INTEGER,
  improved_design_score INTEGER DEFAULT 9,
  
  mockup_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  
  views INTEGER DEFAULT 0,
  views_by_business INTEGER DEFAULT 0,
  views_by_other INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mockups_lead_id ON mockups(lead_id);
CREATE INDEX idx_mockups_url ON mockups(mockup_url);

-- ============================================================================
-- 8. PAYMENT_RECEIPTS TABLE - Payment history
-- ============================================================================
CREATE TABLE payment_receipts (
  id SERIAL PRIMARY KEY,
  receipt_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  close_id INTEGER REFERENCES closes(id) ON DELETE CASCADE,
  
  transaction_id VARCHAR(255) UNIQUE,
  amount_pkr INTEGER,
  payment_method VARCHAR(50),
  payment_date TIMESTAMP DEFAULT NOW(),
  
  payer_name VARCHAR(255),
  payer_phone VARCHAR(20),
  
  receipt_image_url VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 9. ZOOMS TABLE - Demo & Meeting links
-- ============================================================================
CREATE TABLE zooms (
  id SERIAL PRIMARY KEY,
  zoom_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  call_id INTEGER REFERENCES calls(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  
  zoom_link VARCHAR(500) NOT NULL,
  zoom_password VARCHAR(50),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INTEGER,
  
  meeting_notes TEXT,
  recording_url VARCHAR(500),
  
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, started, completed, cancelled
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 10. BUSINESS_TYPES_LOOKUP TABLE - Reference data
-- ============================================================================
CREATE TABLE business_types_lookup (
  id SERIAL PRIMARY KEY,
  type_code VARCHAR(50) PRIMARY KEY,
  type_name_english VARCHAR(100),
  type_name_urdu VARCHAR(100),
  
  avg_price_pkr INTEGER,
  conversion_rate NUMERIC(3,2),
  typical_objection VARCHAR(255),
  
  google_search_query VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert business types
INSERT INTO business_types_lookup (type_code, type_name_english, type_name_urdu, avg_price_pkr, conversion_rate, typical_objection, google_search_query) VALUES
  ('restaurant', 'Restaurant', 'Restaurant/Khana Ghar', 13500, 0.35, 'Bilkul nahi chahiye', 'Restaurant in Sahiwal'),
  ('gym', 'Fitness Center', 'Gym', 11000, 0.25, 'Pehle se kuch hai', 'Gym in Sahiwal'),
  ('dental', 'Dental Clinic', 'Dental Clinic', 13500, 0.40, 'Main busy hoon', 'Dental clinic Sahiwal'),
  ('medical', 'Medical Clinic', 'Medical Clinic', 17500, 0.45, 'Kitna kharcha aega?', 'Doctor clinic Sahiwal'),
  ('education', 'Coaching Center', 'Coaching Center', 12500, 0.30, 'Not interested today', 'Coaching center Sahiwal');

-- ============================================================================
-- 11. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update daily stats on close
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daily_stats
  SET 
    closes = closes + 1,
    revenue_pkr = revenue_pkr + NEW.amount_pkr,
    revenue_total = (SELECT COALESCE(SUM(amount_pkr), 0) FROM closes WHERE DATE(closed_at) = CURRENT_DATE),
    updated_at = NOW()
  WHERE stat_date = CURRENT_DATE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_stats
AFTER INSERT ON closes
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- Update lead status when audit email sent
CREATE OR REPLACE FUNCTION update_lead_status_on_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_sent = TRUE THEN
    UPDATE leads
    SET status = 'contacted', updated_at = NOW()
    WHERE id = NEW.lead_id AND status = 'new';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_status
AFTER UPDATE ON audits
FOR EACH ROW
WHEN (OLD.email_sent IS FALSE AND NEW.email_sent IS TRUE)
EXECUTE FUNCTION update_lead_status_on_audit();

-- ============================================================================
-- 12. SEED DATA (Optional - for testing)
-- ============================================================================

-- Example leads for Sahiwal
INSERT INTO leads (business_type, business_name, owner_name, phone, address, area, business_score) VALUES
  ('restaurant', 'Chai Khana Sahiwal', 'Muhammad Ali', '+923334567890', 'Garden Road, Sahiwal', 'Garden Road', 75),
  ('gym', 'Fitness Palace', 'Ahmed Khan', '+923001234567', 'Khanpur Road, Sahiwal', 'Residential', 65),
  ('dental', 'Dr. Fatima Dental', 'Dr. Fatima', '+923124567890', 'Medical Area, Sahiwal', 'Medical Area', 85),
  ('medical', 'Ali Medical Clinic', 'Dr. Ali', '+923334123456', 'Doctors Road, Sahiwal', 'Medical Area', 80),
  ('education', 'Star Coaching Center', 'Hassan', '+923001112222', 'University Road, Sahiwal', 'Education', 70);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- All tables, indexes, and functions created successfully!
-- You're ready to use the database for TheDevDrive Sahiwal agents.
