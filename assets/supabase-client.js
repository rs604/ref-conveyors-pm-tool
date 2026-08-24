// Ref Conveyors PM Tool — Supabase client
// Project: ref-conveyors-pm-tool (ap-south-1)
// This key is the public "publishable" key — safe to expose in client code.
// It only ever acts within the Row Level Security policies defined on the database.
const SUPABASE_URL = "https://xxzoatpeoyktodvmjbks.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nuFLlXcowPKSnnJ4Ry4VRA_KobjB7sD";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
