import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vsyehwqzhiqdumrnqlsu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWVod3F6aGlxZHVtcm5xbHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTMyNzEsImV4cCI6MjA5MDA2OTI3MX0.9coesQ6n9cp9kiuIQVHyt_4fnkQEtzgM63jP_2PFVTQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
