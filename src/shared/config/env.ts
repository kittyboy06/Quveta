/**
 * Centralized, type-safe environment configuration for Quveta.
 * Provides defaults for local development and handles fallback flags for AI engines and databases.
 */

export const env = {
  // Google Gemini AI configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES !== "false",

  // Application metadata
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Quveta",
  APP_DESCRIPTION:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "AI Event Planning & Adaptive Budget Platform",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",

  // Default Event Preferences
  DEFAULT_CURRENCY: (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "INR") as
    | "INR"
    | "USD"
    | "EUR"
    | "GBP",
  DEFAULT_TIMEZONE: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Asia/Kolkata",

  // Data persistence & optional Supabase connection
  DATABASE_STORAGE_PATH: process.env.DATABASE_STORAGE_PATH || "./data/quveta.db.json",
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Computed helper methods
  isGeminiConfigured: (): boolean => {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    return key.trim().length > 0 && !key.includes("your_gemini_api_key_here");
  },
  isSupabaseConfigured: (): boolean => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    return url.trim().length > 0 && key.trim().length > 0;
  },
  isProduction: (): boolean => process.env.NODE_ENV === "production",
};
