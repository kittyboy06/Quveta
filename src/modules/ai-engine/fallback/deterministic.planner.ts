import { EventPlan } from "../domain/plan.schema";
import { SeedEvent } from "@/shared/db/seed-data";

export function generateDeterministicPlan(event: SeedEvent): EventPlan {
  const isWedding = event.event_type === "wedding";
  const isCorporate = event.event_type === "corporate";
  const isBirthday = event.event_type === "birthday";

  if (isWedding) {
    return {
      summary: `Tailored wedding execution roadmap for ${event.title} in ${event.location} with ${event.guest_count} guests. Budget allocation protects cultural dining and venue hospitality while optimizing floral decor lead times.`,
      assumptions: [
        `Guest count of ${event.guest_count} attendees with ~15% buffer for local RSVP variance.`,
        "Catering requires 50% advance 30 days before event date.",
        "Mandap & floral decoration setup can begin 14 hours prior to ceremony.",
      ],
      milestones: [
        {
          title: "Venue & Mandatory Permits Secured",
          daysBeforeEvent: 90,
          category: "Venue",
          description: "Sign formal contract and secure sound permit for evening festivities.",
        },
        {
          title: "Catering Menu & Tasting Locked",
          daysBeforeEvent: 45,
          category: "Catering",
          description: "Finalize live chaat, main feast, and specialty dessert selections.",
        },
        {
          title: "Invitations & RSVPs Dispatched",
          daysBeforeEvent: 40,
          category: "Invitations",
          description: "Send digital invitation links and dispatch physical mithai boxes.",
        },
        {
          title: "Final Headcount & Run Sheet Sign-off",
          daysBeforeEvent: 10,
          category: "Coordination",
          description: "Confirm final table seating and minute-by-minute vendor cue sheet.",
        },
      ],
      proposedCategories: [
        { name: "Catering & Feast", priority: "MUST_HAVE", allocationRatio: 0.35, explanation: "Core guest experience and hospitality." },
        { name: "Venue & Mandap", priority: "HIGH", allocationRatio: 0.30, explanation: "Central ceremonial stage and guest comfort." },
        { name: "Photography & Video", priority: "HIGH", allocationRatio: 0.14, explanation: "Candid multi-camera coverage and heirloom album." },
        { name: "Floral & Decor", priority: "FLEXIBLE", allocationRatio: 0.10, explanation: "Can scale between lavish fresh blooms and minimalist elegance." },
        { name: "Sound, DJ & Music", priority: "LOW", allocationRatio: 0.05, explanation: "Traditional nadaswaram plus evening reception audio." },
        { name: "Invitations & Stationery", priority: "FLEXIBLE", allocationRatio: 0.03, explanation: "Eco-friendly printed cards and digital RSVP portal." },
        { name: "Contingency Reserve", priority: "FLEXIBLE", allocationRatio: 0.03, explanation: "Buffer for last-minute guest surge or weather adjustments." },
      ],
      proposedTasks: [
        { title: "Finalize Hall Seating Layout & Elder Access Ramp", category: "Venue", priority: "HIGH", estimatedDays: 3, daysBeforeEvent: 60, prerequisiteTitles: [] },
        { title: "Host Tasting Session with Head Caterer", category: "Catering", priority: "HIGH", estimatedDays: 1, daysBeforeEvent: 45, prerequisiteTitles: [] },
        { title: "Dispatch Digital & Eco-Friendly Wedding Invites", category: "Invitations", priority: "HIGH", estimatedDays: 7, daysBeforeEvent: 40, prerequisiteTitles: [] },
        { title: "Review Mandap 3D Stage Sketches & Floral Themes", category: "Decoration", priority: "MEDIUM", estimatedDays: 4, daysBeforeEvent: 30, prerequisiteTitles: [] },
        { title: "Lock Final Headcount with Kitchen Manager", category: "Catering", priority: "CRITICAL", estimatedDays: 2, daysBeforeEvent: 7, prerequisiteTitles: ["Host Tasting Session with Head Caterer", "Dispatch Digital & Eco-Friendly Wedding Invites"] },
        { title: "Rehearse Event-Day Minute-by-Minute Run Sheet", category: "Coordination", priority: "CRITICAL", estimatedDays: 1, daysBeforeEvent: 3, prerequisiteTitles: ["Finalize Hall Seating Layout & Elder Access Ramp"] },
      ],
      riskAnalysis: [
        { risk: "Guest turnout exceeding 200 attendees during evening dinner", severity: "HIGH", mitigation: "Establish a 10% overflow plate clause with caterer at agreed unit rate." },
        { risk: "Floral supply chain price spikes during peak wedding season", severity: "MEDIUM", mitigation: "Lock floral supplier quotation 45 days in advance with seasonal substitute clauses." },
        { risk: "Delays in elder guest transportation during rush hour", severity: "LOW", mitigation: "Pre-book 2 dedicated vans for family transit starting 2 hours early." },
      ],
      missingInformation: [
        "Specific parking capacity of the selected venue.",
        "Whether priest/pandit arrangements include traditional brassware items.",
      ],
    };
  }

  // Corporate / Hackathon / General Default
  return {
    summary: `Structured operational blueprint for ${event.title} in ${event.location} with ${event.guest_count} participants. Prioritizes venue infrastructure, high-throughput network connectivity, and energy catering.`,
    assumptions: [
      `Expected attendance of ${event.guest_count} attendees with strict badge access.`,
      "High-speed fiber connectivity with 4G/5G backup failover.",
      "Catering includes hot lunch, dinner, and midnight snack boxes.",
    ],
    milestones: [
      { title: "Venue & Network Infrastructure Confirmed", daysBeforeEvent: 30, category: "Infrastructure", description: "Test bandwidth and auditorium A/V." },
      { title: "Participant Registration & Badges Finalized", daysBeforeEvent: 14, category: "Registration", description: "Close registrations and print dynamic QR badges." },
      { title: "Catering & Snacks Delivery Schedule Locked", daysBeforeEvent: 7, category: "Catering", description: "Schedule coffee drops and midnight pizza order." },
      { title: "Hackathon Kickoff & Keynotes", daysBeforeEvent: 0, category: "Execution", description: "Opening ceremonies, sponsor problem statements, and hacking launch." },
    ],
    proposedCategories: [
      { name: "Venue & Connectivity", priority: "MUST_HAVE", allocationRatio: 0.35, explanation: "Core power, WiFi, and hacker workstation tables." },
      { name: "Catering & Refreshments", priority: "HIGH", allocationRatio: 0.30, explanation: "Continuous coffee, meals, and midnight fuel." },
      { name: "Prizes & Honorariums", priority: "HIGH", allocationRatio: 0.20, explanation: "Cash prizes, trophies, and judge honorariums." },
      { name: "A/V & Live Stream", priority: "FLEXIBLE", allocationRatio: 0.10, explanation: "4K live streaming and stage lighting." },
      { name: "Badges & Collateral", priority: "LOW", allocationRatio: 0.05, explanation: "Lanyards, stickers, and banner printouts." },
    ],
    proposedTasks: [
      { title: "Conduct WiFi Stress-Test at Venue", category: "Infrastructure", priority: "CRITICAL", estimatedDays: 1, daysBeforeEvent: 20, prerequisiteTitles: [] },
      { title: "Publish Problem Statement Challenges", category: "Planning", priority: "HIGH", estimatedDays: 5, daysBeforeEvent: 14, prerequisiteTitles: [] },
      { title: "Confirm Night Pizza & Drink Delivery Logistics", category: "Catering", priority: "HIGH", estimatedDays: 2, daysBeforeEvent: 7, prerequisiteTitles: [] },
      { title: "Print Attendee Badges & Sponsor Banners", category: "Registration", priority: "MEDIUM", estimatedDays: 3, daysBeforeEvent: 5, prerequisiteTitles: [] },
      { title: "Stage Rehearsal & Live Stream Audio Check", category: "A/V", priority: "HIGH", estimatedDays: 1, daysBeforeEvent: 1, prerequisiteTitles: ["Conduct WiFi Stress-Test at Venue"] },
    ],
    riskAnalysis: [
      { risk: "Venue WiFi congestion during opening hackathon hour", severity: "HIGH", mitigation: "Deploy dedicated SSID for teams with separate guest network." },
      { risk: "Late delivery of midnight refreshments", severity: "MEDIUM", mitigation: "Partner with local 24/7 kitchen with backup vendor on standby." },
    ],
    missingInformation: [
      "Availability of secondary backup diesel generator on site.",
    ],
  };
}
