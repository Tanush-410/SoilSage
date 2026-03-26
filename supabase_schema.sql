-- SoilSage Smart Irrigation System
-- Run this SQL in Supabase Dashboard → SQL Editor

-- 1. Profiles (linked to auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  farm_name text,
  location text default '',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. Fields
create table if not exists fields (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade default auth.uid(),
  name text not null,
  crop_type text not null,
  soil_type text not null default 'Loamy Soil',
  area_hectares numeric default 1,
  growth_stage text default 'Vegetative',
  location text default '',
  latitude numeric,
  longitude numeric,
  soil_moisture numeric default 60,
  soil_ph numeric default 6.5,
  soil_temperature numeric default 25,
  nitrogen numeric default 40,
  phosphorus numeric default 30,
  potassium numeric default 35,
  created_at timestamptz default now()
);
alter table fields enable row level security;
create policy "Users CRUD own fields" on fields for all using (auth.uid() = user_id);

-- 3. Recommendations (AI / ML output)
create table if not exists recommendations (
  id uuid default gen_random_uuid() primary key,
  field_id uuid references fields on delete cascade,
  urgency text default 'low',
  next_irrigation_time text,
  water_amount_liters numeric,
  efficiency_score numeric,
  recommendation_json jsonb,
  created_at timestamptz default now()
);
alter table recommendations enable row level security;
create policy "Users can manage own recs" on recommendations for all
  using (field_id in (select id from fields where user_id = auth.uid()));

-- 4. Irrigation logs
create table if not exists irrigation_logs (
  id uuid default gen_random_uuid() primary key,
  field_id uuid references fields on delete cascade,
  duration_minutes integer,
  water_liters numeric,
  notes text,
  irrigated_at timestamptz default now()
);
alter table irrigation_logs enable row level security;
create policy "Users can manage own logs" on irrigation_logs for all
  using (field_id in (select id from fields where user_id = auth.uid()));
