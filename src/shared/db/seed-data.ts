import { fromMajorUnits } from "../types/money";

export interface SeedEvent {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location: string;
  guest_count: number;
  target_budget: number; // in minor units (paise)
  total_budget?: number;
  start_date?: string;
  end_date?: string;
  user_id?: string;
  currency: string;
  preferences: {
    theme?: string;
    mustHaves: string[];
    priorities: Record<string, "MUST_HAVE" | "HIGH" | "FLEXIBLE" | "LOW">;
    dietary: string[];
    accessibility: string[];
    atmosphere?: string;
  };
  status: "planning" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface SeedCategory {
  id: string;
  event_id: string;
  name: string;
  priority: "MUST_HAVE" | "HIGH" | "FLEXIBLE" | "LOW";
  allocated_amount: number; // minor units
  target_ratio?: number;
}

export interface SeedLineItem {
  id: string;
  event_id: string;
  category_id: string;
  title: string;
  planned_amount: number; // minor units
  cost_type: "FIXED" | "VARIABLE" | "MIXED";
  status: "ESTIMATED" | "QUOTED" | "COMMITTED" | "PAID";
  per_guest_unit_cost: number | null; // minor units
  notes?: string;
  category?: string;
  name?: string;
  estimated_amount?: number;
  actual_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export type SeedBudgetCategory = SeedCategory;
export type SeedBudgetLineItem = SeedLineItem;
export type SeedVendorQuotation = SeedQuotation;

export interface SeedTask {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  category?: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "NOT_STARTED" | "READY" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "TODO";
  start_date?: string;
  due_date: string;
  estimated_days?: number;
  phase?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SeedDependency {
  id: string;
  task_id: string;
  prerequisite_task_id: string;
}

// Module 07: Vendors & Quotations
export interface SeedVendor {
  id: string;
  event_id: string;
  name: string;
  category: "VENUE" | "CATERING" | "PHOTOGRAPHY" | "MUSIC_ENTERTAINMENT" | "DECOR" | "TRANSPORT" | "ATTIRE" | "OTHER";
  contact_person?: string;
  email?: string;
  phone?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  status: "RESEARCHING" | "CONTACTED" | "QUOTED" | "CONTRACT_PENDING" | "BOOKED" | "DECLINED" | "ARCHIVED";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SeedQuotationLineItem {
  description: string;
  amount_minor: number;
  is_mandatory: boolean;
}

export interface SeedQuotation {
  id: string;
  vendor_id: string;
  event_id: string;
  quote_reference: string;
  amount_minor: number; // minor units
  total_amount?: number;
  currency: string;
  status: "DRAFT" | "RECEIVED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  valid_until: string;
  line_items: SeedQuotationLineItem[];
  inclusions: string[];
  exclusions: string[];
  payment_terms?: string;
  deposit_required_minor: number;
  linked_budget_line_item_id?: string;
  notes?: string;
  created_at: string;
}

// Module 08: Run Sheet Items & Incidents
export interface SeedRunSheetItem {
  id: string;
  event_id: string;
  title: string;
  scheduled_start_time: string; // HH:mm
  scheduled_end_time: string; // HH:mm
  actual_start_time?: string;
  actual_end_time?: string;
  category: "CEREMONY" | "RECEPTION" | "CATERING" | "LOGISTICS" | "ENTERTAINMENT" | "SPEECH" | "PHOTO";
  location?: string;
  responsible_person?: string;
  vendor_id?: string;
  linked_task_id?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED" | "SKIPPED";
  notes?: string;
  sequence_order: number;
  created_at: string;
}

export interface SeedRunSheetIncident {
  id: string;
  event_id: string;
  run_sheet_item_id?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  reported_time: string;
  resolved_time?: string;
  resolution_notes?: string;
  reported_by?: string;
}

// Module 09: Guests & Households
export interface SeedHouseholdGroup {
  id: string;
  event_id: string;
  name: string;
  max_guests: number;
}

export interface SeedGuest {
  id: string;
  event_id: string;
  household_group_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  invitation_status: "NOT_SENT" | "SENT" | "DELIVERED" | "BOUNCED";
  rsvp_status: "ATTENDING" | "DECLINED" | "TENTATIVE" | "NO_RESPONSE" | "CONFIRMED";
  plus_one_allowed: boolean;
  plus_one_name?: string;
  plus_ones_count?: number;
  dietary_restrictions: string[]; // e.g. ['VEG', 'JAIN', 'GLUTEN_FREE', 'NUT_ALLERGY']
  accessibility_needs: string[]; // e.g. ['WHEELCHAIR', 'GROUND_FLOOR']
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// Module 10: Seating Tables & Assignments
export interface SeedSeatingTable {
  id: string;
  event_id: string;
  name: string;
  shape: "ROUND" | "RECTANGULAR" | "HEAD_TABLE";
  capacity: number;
  location_zone?: "STAGE_FRONT" | "MAIN_FLOOR" | "BALCONY" | "OUTDOOR" | string;
  accessibility_friendly?: boolean;
  is_accessible?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SeedSeatingAssignment {
  id: string;
  table_id: string;
  guest_id: string;
  seat_number?: number;
  assigned_at: string;
  event_id?: string;
}

// Module 11: Invitations & Communications
export interface SeedInvitationDesign {
  id: string;
  event_id: string;
  title: string;
  template_id: "ELEGANT_WEDDING" | "MODERN_TECH" | "FESTIVE_GALA" | "MINIMALIST";
  headline: string;
  body_text: string;
  dress_code?: string;
  venue_name: string;
  venue_address: string;
  date_time_display: string;
  rsvp_deadline?: string;
  primary_color: string;
  accent_color: string;
  updated_at: string;
}

export interface SeedCommunicationLog {
  id: string;
  event_id: string;
  guest_id?: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP_SIMULATED";
  message_type: "SAVE_THE_DATE" | "FORMAL_INVITE" | "RSVP_REMINDER" | "EVENT_UPDATE";
  status: "DRAFT" | "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
  sent_at: string;
  content_preview: string;
}

// Module 12: Event Insights
export interface SeedEventInsight {
  id: string;
  event_id: string;
  category: "BUDGET_RISK" | "TIMELINE_BOTTLENECK" | "VENDOR_GAP" | "RSVP_ALERT" | "READINESS_SCORE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  description: string;
  evidence_data: Record<string, any>;
  recommended_action?: string;
  action_type?: string;
  created_at: string;
}

// Module 13: Notifications
export interface SeedNotification {
  id: string;
  event_id: string;
  title: string;
  message: string;
  category: "BUDGET" | "TASK" | "VENDOR" | "GUEST" | "RUN_SHEET" | "SYSTEM";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  read: boolean;
  action_url?: string;
  created_at: string;
}

// Module 15: Settings & Audit
export interface SeedEventSettings {
  event_id: string;
  currency: string;
  timezone: string;
  default_catering_budget_per_guest?: number;
  notifications_enabled: boolean;
  ai_features_enabled: boolean;
  privacy_mode: boolean;
  updated_at: string;
}

export interface SeedAuditLog {
  id: string;
  event_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  details: Record<string, any>;
  timestamp: string;
}

// Calculate realistic dates relative to today
const now = new Date();
const addDays = (d: Date, days: number) => {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res.toISOString().split("T")[0];
};

export const INITIAL_SEEDED_EVENTS: SeedEvent[] = [
  {
    id: "evt-wedding-001",
    title: "Aarav & Meera's Traditional Wedding",
    event_type: "wedding",
    event_date: addDays(now, 120), // 4 months from now
    location: "The Grand Palace Hall, Bangalore",
    guest_count: 200,
    target_budget: fromMajorUnits(800000, "INR").amount, // ₹8,00,000 (8 crore paise)
    currency: "INR",
    preferences: {
      theme: "Royal Marigold & Traditional Elegance",
      mustHaves: ["Catering (Authentic South Indian & North Indian Feast)", "Traditional Nadaswaram Ensemble"],
      priorities: {
        "Catering & Feast": "MUST_HAVE",
        "Venue & Mandap": "HIGH",
        "Photography & Video": "HIGH",
        "Floral & Decor": "FLEXIBLE",
        "Sound & DJ": "LOW",
        "Invitations & Gifts": "FLEXIBLE",
      },
      dietary: ["Strict Vegetarian Feast Option", "Jain Food Counter"],
      accessibility: ["Wheelchair Ramp to Mandap", "Ground Floor Seating for Elders"],
      atmosphere: "Warm, traditional, and festive",
    },
    status: "planning",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "evt-hackathon-002",
    title: "TechInnovate Annual Hackathon 2026",
    event_type: "corporate",
    event_date: addDays(now, 45), // 1.5 months from now
    location: "T-Hub Innovation Center, Hyderabad",
    guest_count: 150,
    target_budget: fromMajorUnits(350000, "INR").amount, // ₹3,50,000
    currency: "INR",
    preferences: {
      theme: "Future of AI & Developer Tools",
      mustHaves: ["High-speed Dedicated WiFi (1 Gbps)", "Continuous Coffee & Energy Snacks"],
      priorities: {
        "Venue & Connectivity": "MUST_HAVE",
        "Catering & Refreshments": "HIGH",
        "Prizes & Swag": "HIGH",
        "A/V & Streaming": "FLEXIBLE",
        "Marketing & Collateral": "LOW",
      },
      dietary: ["Halal and Vegan Snack Boxes"],
      accessibility: ["Elevator Access", "Closed Captioning for Keynotes"],
      atmosphere: "High-energy, focused, and collaborative",
    },
    status: "planning",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_SEEDED_CATEGORIES: SeedCategory[] = [
  // Wedding Categories
  { id: "cat-w-venue", event_id: "evt-wedding-001", name: "Venue & Mandap", priority: "HIGH", allocated_amount: fromMajorUnits(250000, "INR").amount },
  { id: "cat-w-catering", event_id: "evt-wedding-001", name: "Catering & Feast", priority: "MUST_HAVE", allocated_amount: fromMajorUnits(280000, "INR").amount },
  { id: "cat-w-photo", event_id: "evt-wedding-001", name: "Photography & Video", priority: "HIGH", allocated_amount: fromMajorUnits(110000, "INR").amount },
  { id: "cat-w-decor", event_id: "evt-wedding-001", name: "Floral & Decor", priority: "FLEXIBLE", allocated_amount: fromMajorUnits(80000, "INR").amount },
  { id: "cat-w-music", event_id: "evt-wedding-001", name: "Sound & DJ", priority: "LOW", allocated_amount: fromMajorUnits(40000, "INR").amount },
  { id: "cat-w-invites", event_id: "evt-wedding-001", name: "Invitations & Gifts", priority: "FLEXIBLE", allocated_amount: fromMajorUnits(40000, "INR").amount },

  // Hackathon Categories
  { id: "cat-h-venue", event_id: "evt-hackathon-002", name: "Venue & Connectivity", priority: "MUST_HAVE", allocated_amount: fromMajorUnits(120000, "INR").amount },
  { id: "cat-h-catering", event_id: "evt-hackathon-002", name: "Catering & Refreshments", priority: "HIGH", allocated_amount: fromMajorUnits(105000, "INR").amount },
  { id: "cat-h-prizes", event_id: "evt-hackathon-002", name: "Prizes & Swag", priority: "HIGH", allocated_amount: fromMajorUnits(75000, "INR").amount },
  { id: "cat-h-av", event_id: "evt-hackathon-002", name: "A/V & Streaming", priority: "FLEXIBLE", allocated_amount: fromMajorUnits(30000, "INR").amount },
  { id: "cat-h-marketing", event_id: "evt-hackathon-002", name: "Marketing & Collateral", priority: "LOW", allocated_amount: fromMajorUnits(20000, "INR").amount },
];

export const INITIAL_SEEDED_LINE_ITEMS: SeedLineItem[] = [
  // Wedding Line Items
  { id: "li-w-1", event_id: "evt-wedding-001", category_id: "cat-w-venue", title: "Palace Hall 2-Day Booking", planned_amount: fromMajorUnits(250000, "INR").amount, cost_type: "FIXED", status: "COMMITTED", per_guest_unit_cost: null, notes: "Advance ₹50,000 paid" },
  { id: "li-w-2", event_id: "evt-wedding-001", category_id: "cat-w-catering", title: "Buffet Dinner & Live Counters", planned_amount: fromMajorUnits(280000, "INR").amount, cost_type: "VARIABLE", status: "COMMITTED", per_guest_unit_cost: fromMajorUnits(1400, "INR").amount, notes: "₹1,400 per guest for 200 guests" },
  { id: "li-w-3", event_id: "evt-wedding-001", category_id: "cat-w-photo", title: "Candid Photography & Cinematic Film", planned_amount: fromMajorUnits(110000, "INR").amount, cost_type: "FIXED", status: "COMMITTED", per_guest_unit_cost: null, notes: "Vendor: LensCraft Studios" },
  { id: "li-w-4", event_id: "evt-wedding-001", category_id: "cat-w-decor", title: "Fresh Jasmine & Marigold Stage Setup", planned_amount: fromMajorUnits(80000, "INR").amount, cost_type: "VARIABLE", status: "ESTIMATED", per_guest_unit_cost: fromMajorUnits(400, "INR").amount, notes: "Can be simplified if budget contracts" },
  { id: "li-w-5", event_id: "evt-wedding-001", category_id: "cat-w-music", title: "Traditional Shehnai & Evening DJ Setup", planned_amount: fromMajorUnits(40000, "INR").amount, cost_type: "FIXED", status: "ESTIMATED", per_guest_unit_cost: null },
  { id: "li-w-6", event_id: "evt-wedding-001", category_id: "cat-w-invites", title: "Printed Eco-Friendly Invitations & Mithai Boxes", planned_amount: fromMajorUnits(40000, "INR").amount, cost_type: "VARIABLE", status: "ESTIMATED", per_guest_unit_cost: fromMajorUnits(200, "INR").amount },

  // Hackathon Line Items
  { id: "li-h-1", event_id: "evt-hackathon-002", category_id: "cat-h-venue", title: "T-Hub Main Auditorium & Lab Space", planned_amount: fromMajorUnits(120000, "INR").amount, cost_type: "FIXED", status: "COMMITTED", per_guest_unit_cost: null },
  { id: "li-h-2", event_id: "evt-hackathon-002", category_id: "cat-h-catering", title: "4 Meals + Midnight Pizza & RedBull", planned_amount: fromMajorUnits(105000, "INR").amount, cost_type: "VARIABLE", status: "ESTIMATED", per_guest_unit_cost: fromMajorUnits(700, "INR").amount },
  { id: "li-h-3", event_id: "evt-hackathon-002", category_id: "cat-h-prizes", title: "Winner Cash Prizes & Trophies", planned_amount: fromMajorUnits(75000, "INR").amount, cost_type: "FIXED", status: "COMMITTED", per_guest_unit_cost: null },
  { id: "li-h-4", event_id: "evt-hackathon-002", category_id: "cat-h-av", title: "Stage Lighting, Mic & 4K Live Stream Rig", planned_amount: fromMajorUnits(30000, "INR").amount, cost_type: "FIXED", status: "QUOTED", per_guest_unit_cost: null },
  { id: "li-h-5", event_id: "evt-hackathon-002", category_id: "cat-h-marketing", title: "Badges, Lanyards & Banners", planned_amount: fromMajorUnits(20000, "INR").amount, cost_type: "VARIABLE", status: "ESTIMATED", per_guest_unit_cost: fromMajorUnits(133, "INR").amount },
];

export const INITIAL_SEEDED_TASKS: SeedTask[] = [
  // Wedding Tasks with Dependencies
  { id: "tsk-w-1", event_id: "evt-wedding-001", title: "Confirm Palace Hall Booking Deposit", description: "Pay remaining 25% booking deposit to secure the 2-day slot.", category: "Venue", priority: "CRITICAL", status: "COMPLETED", start_date: addDays(now, -10), due_date: addDays(now, -2), estimated_days: 2 },
  { id: "tsk-w-2", event_id: "evt-wedding-001", title: "Finalize Seating Layout with Hall Manager", description: "Arrange 200 round-table seating with central aisle and elderly ramp access.", category: "Venue", priority: "HIGH", status: "READY", start_date: addDays(now, 5), due_date: addDays(now, 20), estimated_days: 3 },
  { id: "tsk-w-3", event_id: "evt-wedding-001", title: "Catering Menu Tasting Session", description: "Taste live counter starters and finalize sweets menu with head chef.", category: "Catering", priority: "HIGH", status: "READY", start_date: addDays(now, 10), due_date: addDays(now, 25), estimated_days: 1 },
  { id: "tsk-w-4", event_id: "evt-wedding-001", title: "Lock Final Headcount with Caterer", description: "Confirm exact guest count based on RSVPs for ingredient ordering.", category: "Catering", priority: "CRITICAL", status: "BLOCKED", start_date: addDays(now, 90), due_date: addDays(now, 105), estimated_days: 2 },
  { id: "tsk-w-5", event_id: "evt-wedding-001", title: "Approve Mandap Floral Concept", description: "Review 3D floral sketches and select marigold/rose combination.", category: "Decoration", priority: "MEDIUM", status: "IN_PROGRESS", start_date: addDays(now, 15), due_date: addDays(now, 35), estimated_days: 5 },
  { id: "tsk-w-6", event_id: "evt-wedding-001", title: "Send Digital & Physical Invitations", description: "Dispatch eco-friendly cards and WhatsApp RSVP links to all 200 guests.", category: "Invitations", priority: "HIGH", status: "READY", start_date: addDays(now, 40), due_date: addDays(now, 60), estimated_days: 7 },

  // Hackathon Tasks
  { id: "tsk-h-1", event_id: "evt-hackathon-002", title: "Sign T-Hub Venue Agreement", description: "Execute sponsorship and venue agreement for auditorium.", category: "Venue", priority: "CRITICAL", status: "COMPLETED", start_date: addDays(now, -5), due_date: addDays(now, 2), estimated_days: 1 },
  { id: "tsk-h-2", event_id: "evt-hackathon-002", title: "Finalize Challenge Problem Statements", description: "Review and publish track guidelines for participating teams.", category: "Planning", priority: "HIGH", status: "READY", start_date: addDays(now, 3), due_date: addDays(now, 15), estimated_days: 5 },
  { id: "tsk-h-3", event_id: "evt-hackathon-002", title: "Confirm Night Catering & Pizza Order", description: "Arrange midnight meal logistics for 150 hackers.", category: "Catering", priority: "HIGH", status: "READY", start_date: addDays(now, 20), due_date: addDays(now, 35), estimated_days: 2 },
];

export const INITIAL_SEEDED_DEPENDENCIES: SeedDependency[] = [
  { id: "dep-w-1", task_id: "tsk-w-2", prerequisite_task_id: "tsk-w-1" },
  { id: "dep-w-2", task_id: "tsk-w-4", prerequisite_task_id: "tsk-w-3" },
  { id: "dep-w-3", task_id: "tsk-w-4", prerequisite_task_id: "tsk-w-6" },
];

// Module 07: Vendors
export const INITIAL_SEEDED_VENDORS: SeedVendor[] = [
  {
    id: "ven-w-1",
    event_id: "evt-wedding-001",
    name: "The Grand Palace Hall & Banquets",
    category: "VENUE",
    contact_person: "Mr. Suresh Kulkarni",
    email: "events@grandpalace.com",
    phone: "+91 98450 11223",
    website: "https://grandpalacebangalore.com",
    address: "Palace Cross Road, Vasanth Nagar, Bangalore",
    status: "BOOKED",
    notes: "Main hall booked for 2 days. 25% deposit paid.",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "ven-w-2",
    event_id: "evt-wedding-001",
    name: "Gourmet Feast Caterers & Banquets",
    category: "CATERING",
    contact_person: "Chef Anand Subramaniam",
    email: "anand@gourmetfeast.in",
    phone: "+91 98451 44556",
    website: "https://gourmetfeast.in",
    address: "Indiranagar, Bangalore",
    status: "BOOKED",
    notes: "Full South & North Indian live counters with strict Jain counter.",
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ven-w-3",
    event_id: "evt-wedding-001",
    name: "LensCraft Cinematic Studios",
    category: "PHOTOGRAPHY",
    contact_person: "Pooja Reddy",
    email: "contact@lenscraft.photos",
    phone: "+91 97312 88990",
    website: "https://lenscraft.photos",
    status: "BOOKED",
    notes: "2 Candid photographers + 1 drone operator + teaser film.",
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ven-w-4",
    event_id: "evt-wedding-001",
    name: "Floral Symphony Decorators",
    category: "DECOR",
    contact_person: "Ravi Kumar",
    email: "ravi@floralsymphony.in",
    phone: "+91 98455 33221",
    status: "QUOTED",
    notes: "Submitted ₹80,000 quote for Jasmine/Marigold traditional stage.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "ven-h-1",
    event_id: "evt-hackathon-002",
    name: "T-Hub Facility & Infrastructure Services",
    category: "VENUE",
    contact_person: "Kavita Rao",
    email: "kavita@t-hub.co",
    phone: "+91 99880 77665",
    address: "Knowledge City, Raidurg, Hyderabad",
    status: "BOOKED",
    notes: "Auditorium + 3 breakout labs + 1Gbps fiber.",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ven-h-2",
    event_id: "evt-hackathon-002",
    name: "ByteBites Cloud Kitchens",
    category: "CATERING",
    contact_person: "Imran Khan",
    email: "orders@bytebites.in",
    phone: "+91 91234 56789",
    status: "QUOTED",
    notes: "Catering quote for 150 hackers including midnight pizza.",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Module 07: Quotations
export const INITIAL_SEEDED_QUOTATIONS: SeedQuotation[] = [
  {
    id: "qt-w-catering-1",
    vendor_id: "ven-w-2",
    event_id: "evt-wedding-001",
    quote_reference: "GF-2026-089",
    amount_minor: fromMajorUnits(280000, "INR").amount,
    currency: "INR",
    status: "ACCEPTED",
    valid_until: addDays(now, 30),
    line_items: [
      { description: "South Indian Traditional Plantain Leaf Feast (200 pax)", amount_minor: fromMajorUnits(160000, "INR").amount, is_mandatory: true },
      { description: "North Indian Evening Buffet & Live Chaat Counter", amount_minor: fromMajorUnits(90000, "INR").amount, is_mandatory: true },
      { description: "Dedicated Jain Prep Counter & Service Staff", amount_minor: fromMajorUnits(30000, "INR").amount, is_mandatory: true },
    ],
    inclusions: ["Uniformed Service Staff (25 servers)", "Cutlery & Chafing Dishes", "Complimentary Welcome Drinks"],
    exclusions: ["Table linen and seating", "Alcoholic beverages"],
    payment_terms: "30% Advance on signing, 50% on event morning, 20% on wrap-up",
    deposit_required_minor: fromMajorUnits(84000, "INR").amount,
    linked_budget_line_item_id: "li-w-2",
    notes: "Accepted and linked directly to Catering line item.",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "qt-w-photo-1",
    vendor_id: "ven-w-3",
    event_id: "evt-wedding-001",
    quote_reference: "LC-WED-412",
    amount_minor: fromMajorUnits(110000, "INR").amount,
    currency: "INR",
    status: "ACCEPTED",
    valid_until: addDays(now, 45),
    line_items: [
      { description: "2 Candid Photographers (Full Day)", amount_minor: fromMajorUnits(60000, "INR").amount, is_mandatory: true },
      { description: "Cinematic 4K Highlights Film (5-7 mins)", amount_minor: fromMajorUnits(35000, "INR").amount, is_mandatory: true },
      { description: "Aerial Drone Coverage for Mandap Ceremony", amount_minor: fromMajorUnits(15000, "INR").amount, is_mandatory: false },
    ],
    inclusions: ["Raw footage drive provided within 48h", "Edited teaser in 7 days", "1 Printed Premium Album (40 pages)"],
    exclusions: ["Travel costs outside Bangalore limits"],
    deposit_required_minor: fromMajorUnits(30000, "INR").amount,
    linked_budget_line_item_id: "li-w-3",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "qt-h-catering-1",
    vendor_id: "ven-h-2",
    event_id: "evt-hackathon-002",
    quote_reference: "BB-HACK-104",
    amount_minor: fromMajorUnits(105000, "INR").amount,
    currency: "INR",
    status: "RECEIVED",
    valid_until: addDays(now, 20),
    line_items: [
      { description: "Day 1 Lunch & Dinner Boxed Meals (150 pax)", amount_minor: fromMajorUnits(60000, "INR").amount, is_mandatory: true },
      { description: "Midnight 2AM Fresh Pizza & Energy Drinks", amount_minor: fromMajorUnits(30000, "INR").amount, is_mandatory: true },
      { description: "Day 2 Healthy Breakfast Bowls & Unlimited Coffee", amount_minor: fromMajorUnits(15000, "INR").amount, is_mandatory: true },
    ],
    inclusions: ["All meals individually packed with dietary labels", "Hot coffee dispenser setup throughout night"],
    exclusions: ["Trash disposal bins (venue provided)"],
    deposit_required_minor: fromMajorUnits(30000, "INR").amount,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// Module 08: Run Sheet Items
export const INITIAL_SEEDED_RUN_SHEET_ITEMS: SeedRunSheetItem[] = [
  // Wedding Day Run Sheet
  {
    id: "rs-w-1",
    event_id: "evt-wedding-001",
    title: "Mandap Stage Floral Setup & Acoustic Check",
    scheduled_start_time: "07:00",
    scheduled_end_time: "08:30",
    category: "LOGISTICS",
    location: "Main Hall Mandap Stage",
    responsible_person: "Ravi Kumar (Floral Symphony)",
    vendor_id: "ven-w-4",
    status: "SCHEDULED",
    notes: "Mandap setup must be finalized before groom family arrival.",
    sequence_order: 1,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "rs-w-2",
    event_id: "evt-wedding-001",
    title: "Baraat Procession & Milni Welcome",
    scheduled_start_time: "09:00",
    scheduled_end_time: "10:00",
    category: "CEREMONY",
    location: "Grand Palace Main Entrance Gate",
    responsible_person: "Aarav's Uncle & Coordinator",
    status: "SCHEDULED",
    notes: "Rose petal shower and traditional dhol welcome at the grand arch.",
    sequence_order: 2,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "rs-w-3",
    event_id: "evt-wedding-001",
    title: "Traditional Varmala & Sacred Pheras",
    scheduled_start_time: "10:15",
    scheduled_end_time: "11:45",
    category: "CEREMONY",
    location: "Center Mandap Stage",
    responsible_person: "Chief Priest Pandit Joshi",
    status: "SCHEDULED",
    notes: "Auspicious muhurtham timing is 10:48 AM.",
    sequence_order: 3,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "rs-w-4",
    event_id: "evt-wedding-001",
    title: "Traditional Wedding Feast (South & North Indian)",
    scheduled_start_time: "12:00",
    scheduled_end_time: "14:30",
    category: "CATERING",
    location: "Dining Hall & Live Food Court",
    responsible_person: "Chef Anand (Gourmet Feast)",
    vendor_id: "ven-w-2",
    status: "SCHEDULED",
    notes: "Ensure dedicated Jain counter and elderly seated service.",
    sequence_order: 4,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "rs-w-5",
    event_id: "evt-wedding-001",
    title: "Couple Portraiture & Family Ashirwad",
    scheduled_start_time: "14:45",
    scheduled_end_time: "16:00",
    category: "PHOTO",
    location: "Royal Garden Gazebo",
    responsible_person: "Pooja Reddy (LensCraft Studios)",
    vendor_id: "ven-w-3",
    status: "SCHEDULED",
    notes: "Golden hour lighting shots with extended family members.",
    sequence_order: 5,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },

  // Hackathon Day Run Sheet
  {
    id: "rs-h-1",
    event_id: "evt-hackathon-002",
    title: "Participant Check-In & Swag Bag Distribution",
    scheduled_start_time: "08:00",
    scheduled_end_time: "09:30",
    category: "LOGISTICS",
    location: "T-Hub Ground Floor Atrium",
    responsible_person: "Student Volunteer Lead",
    status: "SCHEDULED",
    sequence_order: 1,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "rs-h-2",
    event_id: "evt-hackathon-002",
    title: "Opening Keynote & AI Track Announcement",
    scheduled_start_time: "09:30",
    scheduled_end_time: "10:15",
    category: "SPEECH",
    location: "Main Auditorium",
    responsible_person: "Organizing Committee",
    status: "SCHEDULED",
    sequence_order: 2,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const INITIAL_SEEDED_INCIDENTS: SeedRunSheetIncident[] = [
  {
    id: "inc-w-1",
    event_id: "evt-wedding-001",
    run_sheet_item_id: "rs-w-1",
    severity: "LOW",
    description: "Floral delivery vehicle arrived 20 minutes behind schedule due to traffic.",
    reported_time: new Date(Date.now() - 86400000).toISOString(),
    resolved_time: new Date(Date.now() - 80000000).toISOString(),
    resolution_notes: "Additional florist assistants deployed to recover buffer time without delaying Baraat.",
    reported_by: "Event Coordinator",
  },
];

// Module 09: Household Groups & Guests
export const INITIAL_SEEDED_HOUSEHOLD_GROUPS: SeedHouseholdGroup[] = [
  { id: "hh-sharma", event_id: "evt-wedding-001", name: "Sharma Family (Groom VIP)", max_guests: 4 },
  { id: "hh-iyer", event_id: "evt-wedding-001", name: "Iyer Family (Bride VIP)", max_guests: 4 },
  { id: "hh-friends", event_id: "evt-wedding-001", name: "Bangalore Tech Circle Friends", max_guests: 5 },
  { id: "hh-hack-team1", event_id: "evt-hackathon-002", name: "Team NeuralForge", max_guests: 4 },
];

export const INITIAL_SEEDED_GUESTS: SeedGuest[] = [
  // Wedding Guests
  {
    id: "gst-w-1",
    event_id: "evt-wedding-001",
    household_group_id: "hh-sharma",
    first_name: "Rajesh",
    last_name: "Sharma",
    email: "rajesh.sharma@example.com",
    phone: "+91 98200 12345",
    invitation_status: "DELIVERED",
    rsvp_status: "ATTENDING",
    plus_one_allowed: true,
    plus_one_name: "Sunita Sharma",
    dietary_restrictions: ["VEG", "JAIN"],
    accessibility_needs: ["GROUND_FLOOR"],
    notes: "Father of the Groom. Requires easy access to Mandap.",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "gst-w-2",
    event_id: "evt-wedding-001",
    household_group_id: "hh-iyer",
    first_name: "Ramanathan",
    last_name: "Iyer",
    email: "r.iyer@example.com",
    phone: "+91 98400 54321",
    invitation_status: "DELIVERED",
    rsvp_status: "ATTENDING",
    plus_one_allowed: true,
    plus_one_name: "Meenakshi Iyer",
    dietary_restrictions: ["VEG"],
    accessibility_needs: ["WHEELCHAIR"],
    notes: "Grandfather of the Bride. Requires wheelchair ramp access.",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "gst-w-3",
    event_id: "evt-wedding-001",
    household_group_id: "hh-friends",
    first_name: "Rohan",
    last_name: "Mehta",
    email: "rohan.mehta@tech.io",
    phone: "+91 99100 88223",
    invitation_status: "DELIVERED",
    rsvp_status: "ATTENDING",
    plus_one_allowed: false,
    dietary_restrictions: ["GLUTEN_FREE"],
    accessibility_needs: [],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "gst-w-4",
    event_id: "evt-wedding-001",
    household_group_id: "hh-friends",
    first_name: "Ananya",
    last_name: "Roy",
    email: "ananya.roy@design.in",
    phone: "+91 98310 99441",
    invitation_status: "DELIVERED",
    rsvp_status: "ATTENDING",
    plus_one_allowed: false,
    dietary_restrictions: ["VEGAN"],
    accessibility_needs: [],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "gst-w-5",
    event_id: "evt-wedding-001",
    household_group_id: "hh-friends",
    first_name: "Vikram",
    last_name: "Malhotra",
    email: "vikram.m@investments.com",
    phone: "+91 98110 33445",
    invitation_status: "SENT",
    rsvp_status: "TENTATIVE",
    plus_one_allowed: true,
    dietary_restrictions: ["NUT_ALLERGY"],
    accessibility_needs: [],
    notes: "Awaiting confirmation on business travel schedule.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "gst-w-6",
    event_id: "evt-wedding-001",
    first_name: "Karan",
    last_name: "Johar",
    email: "karan.j@cinema.in",
    invitation_status: "SENT",
    rsvp_status: "NO_RESPONSE",
    plus_one_allowed: false,
    dietary_restrictions: [],
    accessibility_needs: [],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },

  // Hackathon Guests
  {
    id: "gst-h-1",
    event_id: "evt-hackathon-002",
    household_group_id: "hh-hack-team1",
    first_name: "Arjun",
    last_name: "Varma",
    email: "arjun@neuralforge.dev",
    invitation_status: "DELIVERED",
    rsvp_status: "ATTENDING",
    plus_one_allowed: false,
    dietary_restrictions: ["HALAL"],
    accessibility_needs: [],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "gst-h-2",
    event_id: "evt-hackathon-002",
    household_group_id: "hh-hack-team1",
    first_name: "Sneha",
    last_name: "Patil",
    email: "sneha@neuralforge.dev",
    invitation_status: "DELIVERED",
    rsvp_status: "ATTENDING",
    plus_one_allowed: false,
    dietary_restrictions: ["VEGAN"],
    accessibility_needs: [],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Module 10: Seating Tables & Assignments
export const INITIAL_SEEDED_SEATING_TABLES: SeedSeatingTable[] = [
  // Wedding Tables
  {
    id: "tbl-w-1",
    event_id: "evt-wedding-001",
    name: "VIP Elders & Family Table 1",
    shape: "ROUND",
    capacity: 8,
    location_zone: "STAGE_FRONT",
    accessibility_friendly: true,
    notes: "Immediate step-free access to Mandap ramp for grandparents.",
  },
  {
    id: "tbl-w-2",
    event_id: "evt-wedding-001",
    name: "Groom Family Table 2",
    shape: "ROUND",
    capacity: 10,
    location_zone: "MAIN_FLOOR",
    accessibility_friendly: true,
    notes: "Close to central dining passage.",
  },
  {
    id: "tbl-w-3",
    event_id: "evt-wedding-001",
    name: "Friends & Colleagues Table 3",
    shape: "ROUND",
    capacity: 8,
    location_zone: "MAIN_FLOOR",
    accessibility_friendly: false,
    notes: "Next to live mocktail bar.",
  },
  {
    id: "tbl-w-4",
    event_id: "evt-wedding-001",
    name: "Garden Courtyard Table 4",
    shape: "ROUND",
    capacity: 8,
    location_zone: "OUTDOOR",
    accessibility_friendly: false,
  },

  // Hackathon Tables
  {
    id: "tbl-h-1",
    event_id: "evt-hackathon-002",
    name: "Hacking Pod Alpha",
    shape: "RECTANGULAR",
    capacity: 6,
    location_zone: "MAIN_FLOOR",
    accessibility_friendly: true,
    notes: "Equipped with dual power strips and LAN ports.",
  },
];

export const INITIAL_SEEDED_SEATING_ASSIGNMENTS: SeedSeatingAssignment[] = [
  { id: "sa-w-1", table_id: "tbl-w-1", guest_id: "gst-w-1", seat_number: 1, assigned_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "sa-w-2", table_id: "tbl-w-1", guest_id: "gst-w-2", seat_number: 2, assigned_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "sa-w-3", table_id: "tbl-w-3", guest_id: "gst-w-3", seat_number: 1, assigned_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "sa-w-4", table_id: "tbl-w-3", guest_id: "gst-w-4", seat_number: 2, assigned_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "sa-h-1", table_id: "tbl-h-1", guest_id: "gst-h-1", seat_number: 1, assigned_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "sa-h-2", table_id: "tbl-h-1", guest_id: "gst-h-2", seat_number: 2, assigned_at: new Date(Date.now() - 86400000).toISOString() },
];

// Module 11: Invitations & Communication Logs
export const INITIAL_SEEDED_INVITATIONS: SeedInvitationDesign[] = [
  {
    id: "inv-w-1",
    event_id: "evt-wedding-001",
    title: "Aarav & Meera Wedding Invitation",
    template_id: "ELEGANT_WEDDING",
    headline: "Two Hearts, One Celebration",
    body_text: "Together with their families, Aarav Sharma and Meera Iyer joyfully invite you to celebrate their sacred wedding ceremony and union.",
    dress_code: "Traditional Indian Festive / Formal Silk",
    venue_name: "The Grand Palace Hall",
    venue_address: "Palace Cross Road, Vasanth Nagar, Bangalore",
    date_time_display: "Sunday, August 23, 2026 at 9:00 AM IST",
    rsvp_deadline: addDays(now, 90),
    primary_color: "#5B21B6",
    accent_color: "#F59E0B",
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "inv-h-1",
    event_id: "evt-hackathon-002",
    title: "TechInnovate 2026 Developer Pass",
    template_id: "MODERN_TECH",
    headline: "Code. Innovate. Deploy.",
    body_text: "Welcome to TechInnovate 2026! 36 hours of relentless building with world-class mentors, cutting-edge AI models, and ₹3,50,000 in prizes.",
    dress_code: "Casual / Developer Hoodie",
    venue_name: "T-Hub Innovation Center",
    venue_address: "Knowledge City, Raidurg, Hyderabad",
    date_time_display: "Saturday, June 8, 2026 at 8:00 AM IST",
    rsvp_deadline: addDays(now, 30),
    primary_color: "#1E1B4B",
    accent_color: "#38BDF8",
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_SEEDED_COMMUNICATION_LOGS: SeedCommunicationLog[] = [
  {
    id: "comm-w-1",
    event_id: "evt-wedding-001",
    guest_id: "gst-w-1",
    channel: "EMAIL",
    message_type: "FORMAL_INVITE",
    status: "DELIVERED",
    sent_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    content_preview: "Dear Rajesh Sharma, you and your family are cordially invited to Aarav & Meera's Wedding...",
  },
  {
    id: "comm-w-2",
    event_id: "evt-wedding-001",
    guest_id: "gst-w-6",
    channel: "WHATSAPP_SIMULATED",
    message_type: "RSVP_REMINDER",
    status: "SENT",
    sent_at: new Date(Date.now() - 86400000).toISOString(),
    content_preview: "Namaste Karan! Just a gentle reminder to please confirm your attendance for Aarav & Meera's Wedding by...",
  },
];

// Module 12: Event Insights
export const INITIAL_SEEDED_INSIGHTS: SeedEventInsight[] = [
  {
    id: "ins-w-1",
    event_id: "evt-wedding-001",
    category: "BUDGET_RISK",
    severity: "INFO",
    title: "Catering Quoted Amount Fully Committed",
    description: "Catering quotation from Gourmet Feast Caterers (₹2,80,000) was accepted and aligns with the allocated budget with 0 variance.",
    evidence_data: { category: "Catering & Feast", allocated: 280000, actual: 280000, variance: 0 },
    recommended_action: "Lock in final headcount 14 days prior to avoid per-plate penalties.",
    action_type: "NAVIGATE",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "ins-w-2",
    event_id: "evt-wedding-001",
    category: "RSVP_ALERT",
    severity: "WARNING",
    title: "1 Pending RSVP with Dietary Restrictions",
    description: "Vikram Malhotra has tentative status with a noted Nut Allergy. Ensure confirmation before finalizing chef ingredient order.",
    evidence_data: { guest_id: "gst-w-5", name: "Vikram Malhotra", allergy: "NUT_ALLERGY" },
    recommended_action: "Send personalized WhatsApp reminder.",
    action_type: "OPEN_MODAL",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Module 13: In-App Notifications
export const INITIAL_SEEDED_NOTIFICATIONS: SeedNotification[] = [
  {
    id: "notif-w-1",
    event_id: "evt-wedding-001",
    title: "Vendor Quotation Accepted",
    message: "Gourmet Feast Caterers quotation of ₹2,80,000 has been committed to the event budget.",
    category: "VENDOR",
    priority: "MEDIUM",
    read: false,
    action_url: "/events/evt-wedding-001/vendors",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "notif-w-2",
    event_id: "evt-wedding-001",
    title: "Mandap Floral Setup Due for Review",
    message: "Task 'Approve Mandap Floral Concept' is currently In Progress and due in 15 days.",
    category: "TASK",
    priority: "LOW",
    read: true,
    action_url: "/events/evt-wedding-001/timeline",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "notif-h-1",
    event_id: "evt-hackathon-002",
    title: "Sign Venue Agreement Completed",
    message: "T-Hub facility sponsorship agreement has been marked completed.",
    category: "TASK",
    priority: "MEDIUM",
    read: false,
    action_url: "/events/evt-hackathon-002/timeline",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Module 15: Event Settings & Audit
export const INITIAL_SEEDED_SETTINGS: SeedEventSettings[] = [
  {
    event_id: "evt-wedding-001",
    currency: "INR",
    timezone: "Asia/Kolkata",
    default_catering_budget_per_guest: fromMajorUnits(1400, "INR").amount,
    notifications_enabled: true,
    ai_features_enabled: true,
    privacy_mode: false,
    updated_at: new Date().toISOString(),
  },
  {
    event_id: "evt-hackathon-002",
    currency: "INR",
    timezone: "Asia/Kolkata",
    default_catering_budget_per_guest: fromMajorUnits(700, "INR").amount,
    notifications_enabled: true,
    ai_features_enabled: true,
    privacy_mode: false,
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_SEEDED_AUDIT_LOGS: SeedAuditLog[] = [
  {
    id: "aud-w-1",
    event_id: "evt-wedding-001",
    action: "EVENT_CREATED",
    entity_type: "EVENT",
    entity_id: "evt-wedding-001",
    actor: "Aarav Sharma (Organizer)",
    details: { title: "Aarav & Meera's Traditional Wedding", guest_count: 200, budget: 800000 },
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "aud-w-2",
    event_id: "evt-wedding-001",
    action: "VENDOR_QUOTE_ACCEPTED",
    entity_type: "QUOTATION",
    entity_id: "qt-w-catering-1",
    actor: "Aarav Sharma",
    details: { vendor: "Gourmet Feast Caterers", amount: 280000, linked_line_item: "li-w-2" },
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];
