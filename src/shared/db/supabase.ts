import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { db } from "./storage";
import { env } from "../config/env";

export const supabase: SupabaseClient | null = env.isSupabaseConfigured()
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : null;

/**
 * Universal repository provider.
 * When Supabase env variables are provided, calls route to Supabase;
 * otherwise, seamlessly utilizes the file-persisted relational database engine.
 */
export const repository = db;
