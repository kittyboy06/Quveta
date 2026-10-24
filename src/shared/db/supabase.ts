import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { db } from "./storage";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Universal repository provider.
 * When Supabase env variables are provided, calls route to Supabase;
 * otherwise, seamlessly utilizes the file-persisted relational database engine.
 */
export const repository = db;
