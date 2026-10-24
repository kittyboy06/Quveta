-- ====================================================================
-- Quveta Core Database Schema (PostgreSQL / Supabase)
-- ====================================================================

-- 1. Events & Preference Specifications
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'wedding', 'birthday', 'corporate', 'community', 'engagement', 'college', 'other'
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count >= 0),
  target_budget BIGINT NOT NULL CHECK (target_budget >= 0), -- minor units (paise)
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'confirmed', 'completed', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Budget Structure & Line Items
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'FLEXIBLE', -- 'MUST_HAVE', 'HIGH', 'FLEXIBLE', 'LOW'
  allocated_amount BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  planned_amount BIGINT NOT NULL DEFAULT 0,
  cost_type TEXT NOT NULL DEFAULT 'FIXED', -- 'FIXED', 'VARIABLE', 'MIXED'
  status TEXT NOT NULL DEFAULT 'ESTIMATED', -- 'ESTIMATED', 'QUOTED', 'COMMITTED', 'PAID'
  per_guest_unit_cost BIGINT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Adaptive Simulator Scenarios & Selective Approval
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  proposed_budget BIGINT NOT NULL,
  proposed_guest_count INTEGER NOT NULL,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'APPLIED', 'REJECTED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scenario_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  action TEXT NOT NULL,
  current_amount BIGINT NOT NULL,
  proposed_amount BIGINT NOT NULL,
  trade_off_explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' -- 'PENDING', 'ACCEPTED', 'REJECTED'
);

-- 4. Tasks & Directed Acyclic Graph (DAG) Dependencies
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  status TEXT NOT NULL DEFAULT 'NOT_STARTED', -- 'NOT_STARTED', 'READY', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'
  start_date DATE,
  due_date DATE,
  estimated_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  prerequisite_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(task_id, prerequisite_task_id)
);

-- ====================================================================
-- SPRINT A: Guest & Event Coordination Suite
-- ====================================================================

-- 5. Vendor & Quotation Management (Module 07)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'VENUE', 'CATERING', 'PHOTOGRAPHY', 'MUSIC_ENTERTAINMENT', 'DECOR', 'TRANSPORT', 'ATTIRE', 'OTHER'
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'RESEARCHING', -- 'RESEARCHING', 'CONTACTED', 'QUOTED', 'CONTRACT_PENDING', 'BOOKED', 'DECLINED', 'ARCHIVED'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  quote_reference TEXT,
  amount_minor BIGINT NOT NULL, -- minor units (paise/cents)
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'RECEIVED', -- 'DRAFT', 'RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'EXPIRED'
  valid_until DATE,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  payment_terms TEXT,
  deposit_required_minor BIGINT DEFAULT 0,
  linked_budget_line_item_id UUID REFERENCES budget_line_items(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Event-Day Run Sheet & Incidents (Module 08)
CREATE TABLE IF NOT EXISTS run_sheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  actual_start_time TIME,
  actual_end_time TIME,
  category TEXT NOT NULL, -- 'CEREMONY', 'RECEPTION', 'CATERING', 'LOGISTICS', 'ENTERTAINMENT', 'SPEECH', 'PHOTO'
  location TEXT,
  responsible_person TEXT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  linked_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SKIPPED'
  notes TEXT,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS run_sheet_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  run_sheet_item_id UUID REFERENCES run_sheet_items(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  description TEXT NOT NULL,
  reported_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_time TIMESTAMPTZ,
  resolution_notes TEXT,
  reported_by TEXT
);

-- 7. Guests & Household Groups (Module 09)
CREATE TABLE IF NOT EXISTS household_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  household_group_id UUID REFERENCES household_groups(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  invitation_status TEXT NOT NULL DEFAULT 'NOT_SENT', -- 'NOT_SENT', 'SENT', 'DELIVERED', 'BOUNCED'
  rsvp_status TEXT NOT NULL DEFAULT 'NO_RESPONSE', -- 'ATTENDING', 'DECLINED', 'TENTATIVE', 'NO_RESPONSE'
  plus_one_allowed BOOLEAN NOT NULL DEFAULT false,
  plus_one_name TEXT,
  dietary_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ['VEG', 'JAIN', 'GLUTEN_FREE', 'NUT_ALLERGY']
  accessibility_needs JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ['WHEELCHAIR', 'GROUND_FLOOR']
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Seating Tables & Assignments (Module 10)
CREATE TABLE IF NOT EXISTS seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shape TEXT NOT NULL DEFAULT 'ROUND', -- 'ROUND', 'RECTANGULAR', 'HEAD_TABLE'
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  location_zone TEXT NOT NULL DEFAULT 'MAIN_FLOOR', -- 'STAGE_FRONT', 'MAIN_FLOOR', 'BALCONY', 'OUTDOOR'
  accessibility_friendly BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS seating_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  seat_number INTEGER,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_guest_seating UNIQUE (guest_id)
);

-- 9. Invitations & Communications (Module 11)
CREATE TABLE IF NOT EXISTS invitation_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'ELEGANT_WEDDING', -- 'ELEGANT_WEDDING', 'MODERN_TECH', 'FESTIVE_GALA', 'MINIMALIST'
  headline TEXT NOT NULL,
  body_text TEXT NOT NULL,
  dress_code TEXT,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  date_time_display TEXT NOT NULL,
  rsvp_deadline DATE,
  primary_color TEXT DEFAULT '#5B21B6',
  accent_color TEXT DEFAULT '#E9D5FF',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'EMAIL', -- 'EMAIL', 'SMS', 'WHATSAPP_SIMULATED'
  message_type TEXT NOT NULL DEFAULT 'FORMAL_INVITE', -- 'SAVE_THE_DATE', 'FORMAL_INVITE', 'RSVP_REMINDER', 'EVENT_UPDATE'
  status TEXT NOT NULL DEFAULT 'SENT', -- 'DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  content_preview TEXT
);

-- ====================================================================
-- SPRINT B: Intelligence, Platform & Exports Suite
-- ====================================================================

-- 10. AI Event Insights & Readiness (Module 12)
CREATE TABLE IF NOT EXISTS event_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'BUDGET_RISK', 'TIMELINE_BOTTLENECK', 'VENDOR_GAP', 'RSVP_ALERT', 'READINESS_SCORE'
  severity TEXT NOT NULL DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommended_action TEXT,
  action_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. In-App Notifications & Reminders (Module 13)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'SYSTEM', -- 'BUDGET', 'TASK', 'VENDOR', 'GUEST', 'RUN_SHEET', 'SYSTEM'
  priority TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Settings & Security Audit (Module 15)
CREATE TABLE IF NOT EXISTS event_settings (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  default_catering_budget_per_guest BIGINT DEFAULT 150000,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_features_enabled BOOLEAN NOT NULL DEFAULT true,
  privacy_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'Event Planner',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
