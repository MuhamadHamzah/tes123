/*
  # Create Members Table

  ## Description
  Creates a new members table for storing HMPTI member information with
  support for unlimited batches/angkatan that can be added dynamically.

  ## Tables Created
  
  1. **members** - Stores HMPTI member information
     - `id` (uuid, primary key) - Unique identifier
     - `name` (text) - Member's full name
     - `position` (text) - Member's position/role in organization
     - `generation` (integer) - Generation/batch number (starting from 1)
     - `photo_url` (text) - URL to uploaded photo
     - `order_index` (integer) - Display order within generation
     - `created_at` (timestamptz) - Record creation timestamp
     - `updated_at` (timestamptz) - Record update timestamp

  ## Changes Made
  
  1. Create members table with all required fields
  2. Add storage bucket for member photos
  3. Enable RLS on members table
  4. Add policies for public read and authenticated write access
  5. Create indexes for performance optimization

  ## Security
  
  - RLS enabled on members table
  - Public can SELECT (view) all members
  - Only authenticated users can INSERT, UPDATE, DELETE members
  - Storage bucket configured for member photos with appropriate policies

  ## Important Notes
  
  - No limit on generation numbers - new batches can be added anytime
  - Members are ordered by generation first, then by order_index
  - order_index allows custom sorting within each generation (e.g., president first, then vice president, etc.)
*/

-- Drop old gallery_items table
DROP TABLE IF EXISTS gallery_items CASCADE;

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  generation integer NOT NULL CHECK (generation >= 1),
  photo_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Policies for members table
CREATE POLICY "Anyone can view members"
  ON members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update members"
  ON members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS members_generation_idx ON members(generation);
CREATE INDEX IF NOT EXISTS members_order_idx ON members(order_index);

-- Create storage bucket for member photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for member photos
CREATE POLICY "Public can view member photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'member-photos');

CREATE POLICY "Authenticated users can upload member photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'member-photos');

CREATE POLICY "Authenticated users can update member photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'member-photos')
  WITH CHECK (bucket_id = 'member-photos');

CREATE POLICY "Authenticated users can delete member photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'member-photos');

-- Create storage buckets for slides and events
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('slides', 'slides', true),
  ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for slides
CREATE POLICY "Public can view slides"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'slides');

CREATE POLICY "Authenticated users can upload slides"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'slides');

CREATE POLICY "Authenticated users can update slides"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'slides')
  WITH CHECK (bucket_id = 'slides');

CREATE POLICY "Authenticated users can delete slides"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'slides');

-- Storage policies for events
CREATE POLICY "Public can view event photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'events');

CREATE POLICY "Authenticated users can upload event photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'events');

CREATE POLICY "Authenticated users can update event photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'events')
  WITH CHECK (bucket_id = 'events');

CREATE POLICY "Authenticated users can delete event photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'events');


DROP TABLE IF EXISTS team_members CASCADE;

-- Buat tabel contact_info
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert data awal
INSERT INTO contact_info (phone, email, address) 
VALUES (
  '+62 812-3456-7890',
  'info@hmpti.edu',
  'Jl. Universitas No. 123, Banjarmasin'
) ON CONFLICT DO NOTHING;

-- Buat tabel site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert data awal settings
INSERT INTO site_settings (key, value) 
VALUES 
  ('events_page_heading', 'Ikuti Event Terbaru Kami!'),
  ('member_registration_url', 'https://forms.google.com/member'),
  ('event_registration_url', 'https://forms.google.com/event'),
  ('admin_notification_email', 'admin@hmpti.edu')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk authenticated users (admin)
CREATE POLICY "Allow authenticated users to read contact_info"
  ON contact_info FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update contact_info"
  ON contact_info FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read site_settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update site_settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true);

-- Jika ingin public bisa baca (untuk frontend)
CREATE POLICY "Allow public to read contact_info"
  ON contact_info FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public to read site_settings"
  ON site_settings FOR SELECT
  TO anon
  USING (true);

  -- Buat tabel messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy untuk insert (public bisa insert)
CREATE POLICY "Allow public to insert messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy untuk select (hanya authenticated/admin)
CREATE POLICY "Allow authenticated to read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

-- Policy untuk update (hanya authenticated/admin)
CREATE POLICY "Allow authenticated to update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (true);

-- Policy untuk delete (hanya authenticated/admin)
CREATE POLICY "Allow authenticated to delete messages"
  ON messages FOR DELETE
  TO authenticated
  USING (true);