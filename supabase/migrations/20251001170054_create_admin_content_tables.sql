/*
  # Create Admin Content Management Tables

  ## Tables Created
  
  1. **slides** - Untuk menyimpan gambar slide homepage
     - `id` (uuid, primary key)
     - `image_url` (text) - URL gambar slide
     - `title` (text) - Judul slide
     - `description` (text) - Deskripsi slide
     - `order_index` (integer) - Urutan tampilan
     - `is_active` (boolean) - Status aktif/nonaktif
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **team_members** - Untuk menyimpan daftar tim
     - `id` (uuid, primary key)
     - `name` (text) - Nama anggota tim
     - `position` (text) - Jabatan
     - `photo_url` (text) - URL foto
     - `bio` (text) - Biografi singkat
     - `order_index` (integer) - Urutan tampilan
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. **events** - Untuk menyimpan event
     - `id` (uuid, primary key)
     - `title` (text) - Judul event
     - `description` (text) - Deskripsi event
     - `image_url` (text) - URL gambar event
     - `event_date` (timestamptz) - Tanggal event
     - `location` (text) - Lokasi event
     - `is_published` (boolean) - Status publikasi
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **gallery_items** - Untuk menyimpan item galeri
     - `id` (uuid, primary key)
     - `title` (text) - Judul foto
     - `image_url` (text) - URL gambar
     - `description` (text) - Deskripsi
     - `category` (text) - Kategori
     - `order_index` (integer) - Urutan tampilan
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Security
  - Enable RLS pada semua tabel
  - Hanya authenticated admin yang bisa INSERT, UPDATE, DELETE
  - Public bisa SELECT untuk melihat konten
*/

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  photo_url text NOT NULL,
  bio text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Policies for slides table
CREATE POLICY "Anyone can view active slides"
  ON slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all slides"
  ON slides FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert slides"
  ON slides FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update slides"
  ON slides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete slides"
  ON slides FOR DELETE
  TO authenticated
  USING (true);

-- Policies for team_members table
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (true);

-- Policies for events table
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Policies for gallery_items table
CREATE POLICY "Anyone can view gallery items"
  ON gallery_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS slides_order_idx ON slides(order_index);
CREATE INDEX IF NOT EXISTS team_members_order_idx ON team_members(order_index);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(event_date);
CREATE INDEX IF NOT EXISTS gallery_items_order_idx ON gallery_items(order_index);
CREATE INDEX IF NOT EXISTS gallery_items_category_idx ON gallery_items(category);