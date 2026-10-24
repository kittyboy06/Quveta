"use server";

import { db } from "@/shared/db/storage";
import { safeRevalidatePath } from "@/shared/utils/cache";
import {
  InvitationDesignFormSchema,
  ReminderCampaignFormSchema,
  InvitationDesignFormData,
  ReminderCampaignFormData,
} from "../domain/invitation.schema";
import { interpolateTemplate } from "../domain/template.interpolator";

export async function saveInvitationDesignAction(
  eventId: string,
  data: InvitationDesignFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = InvitationDesignFormSchema.parse(data);
    db.saveInvitationDesign({
      event_id: eventId,
      title: validated.title.trim(),
      template_id: validated.template_id,
      headline: validated.headline.trim(),
      body_text: validated.body_text.trim(),
      dress_code: validated.dress_code?.trim() || undefined,
      venue_name: validated.venue_name.trim(),
      venue_address: validated.venue_address.trim(),
      date_time_display: validated.date_time_display.trim(),
      rsvp_deadline: validated.rsvp_deadline || undefined,
      primary_color: validated.primary_color,
      accent_color: validated.accent_color,
    });

    safeRevalidatePath(`/events/${eventId}/invitations`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save invitation design." };
  }
}

export async function sendRsvpRemindersAction(
  eventId: string,
  data: ReminderCampaignFormData
): Promise<{ success: boolean; sentCount?: number; error?: string }> {
  try {
    const validated = ReminderCampaignFormSchema.parse(data);
    const event = db.getEventById(eventId);
    if (!event) return { success: false, error: "Event not found." };

    const guests = db.getGuestsByEventId(eventId);
    const targetGuests = guests.filter((g) => {
      if (validated.target_filter === "NO_RESPONSE_ONLY") {
        return g.rsvp_status === "NO_RESPONSE";
      }
      return g.rsvp_status === "NO_RESPONSE" || g.rsvp_status === "TENTATIVE";
    });

    let sent = 0;
    for (const guest of targetGuests) {
      const personalized = interpolateTemplate(validated.custom_message, {
        guest_name: `${guest.first_name} ${guest.last_name}`,
        event_title: event.title,
        date: event.event_date,
        venue: event.location,
        rsvp_link: `https://quveta.app/rsvp/${event.id}?g=${guest.id}`,
      });

      db.createCommunicationLog({
        event_id: eventId,
        guest_id: guest.id,
        channel: validated.channel,
        message_type: "RSVP_REMINDER",
        status: "SENT",
        content_preview: personalized,
      });

      // Update guest invitation status
      db.updateGuest(guest.id, { invitation_status: "SENT" });
      sent++;
    }

    safeRevalidatePath(`/events/${eventId}/invitations`);
    safeRevalidatePath(`/events/${eventId}/guests`);
    return { success: true, sentCount: sent };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to dispatch RSVP reminder campaign." };
  }
}

export async function generateAiInvitationDraftAction(
  eventId: string,
  tone: string
): Promise<{ headline: string; body_text: string }> {
  const event = db.getEventById(eventId);
  if (!event) {
    return {
      headline: "You Are Cordially Invited",
      body_text: "Join us in celebrating this special occasion with warmth, joy, and togetherness.",
    };
  }

  // Deterministic rule engine fallback
  if (event.event_type === "wedding") {
    return {
      headline: "Two Souls, One Sacred Journey",
      body_text: `With joy and gratitude in our hearts, we invite you to share in the wedding celebrations of ${event.title}. Your presence and blessings will make our special day truly unforgettable.`,
    };
  } else if (event.event_type === "corporate") {
    return {
      headline: "Innovate. Connect. Build the Future.",
      body_text: `You're invited to ${event.title}! Join industry leaders, creators, and engineers at ${event.location} for an immersive celebration of technology and collaboration.`,
    };
  }

  return {
    headline: `Join Us for ${event.title}`,
    body_text: `We warmly welcome you to celebrate with us on ${event.event_date} at ${event.location}. Please confirm your attendance at your earliest convenience.`,
  };
}
