/*
  # Fixed Admin Content Management Tables with Relationships
  
  ## Relasi Antar Tabel:
  - slides → site_settings: Tidak ada relasi (independent)
  - team_members → site_settings: Tidak ada relasi (independent)
  - events → event_categories: One-to-Many (1 category punya banyak events)
  - gallery_items → site_settings: Tidak ada relasi (independent)

  ## Changes:
  - Tambah event_categories table
  - Tambah foreign key events.category_id → event_categories.id
  - Drop policies lama sebelum buat yang baru untuk hindari duplikat
*/

-- ============================================
-- 1. CREATE EVENT CATEGORIES TABLE (Parent)
-- ============================================
CREATE TABLE IF NOT EXISTS event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. CREATE SLIDES TABLE
-- ============================================
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

-- ============================================
-- 3. CREATE TEAM MEMBERS TABLE
-- ============================================
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

-- ============================================
-- 4. CREATE EVENTS TABLE (Child of event_categories)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  event_date timestamptz NOT NULL,
  event_time time DEFAULT '00:00',
  location text NOT NULL,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add category_id column if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS category_id uuid;

-- Add foreign key constraint if it doesn't exist
ALTER TABLE events ADD CONSTRAINT events_category_fk 
FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE SET NULL;

-- ============================================
-- 5. CREATE GALLERY ITEMS TABLE
-- ============================================
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

-- ============================================
-- 6. CREATE SITE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. DROP EXISTING POLICIES (untuk hindari duplikat)
-- ============================================

-- Drop event_categories policies
DROP POLICY IF EXISTS "Anyone can view event categories" ON event_categories;
DROP POLICY IF EXISTS "Authenticated users can insert event categories" ON event_categories;
DROP POLICY IF EXISTS "Authenticated users can update event categories" ON event_categories;
DROP POLICY IF EXISTS "Authenticated users can delete event categories" ON event_categories;

-- Drop slides policies
DROP POLICY IF EXISTS "Anyone can view active slides" ON slides;
DROP POLICY IF EXISTS "Authenticated users can view all slides" ON slides;
DROP POLICY IF EXISTS "Authenticated users can insert slides" ON slides;
DROP POLICY IF EXISTS "Authenticated users can update slides" ON slides;
DROP POLICY IF EXISTS "Authenticated users can delete slides" ON slides;

-- Drop team_members policies
DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON team_members;

-- Drop events policies
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON events;

-- Drop gallery_items policies
DROP POLICY IF EXISTS "Anyone can view gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can update gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can delete gallery items" ON gallery_items;

-- Drop site_settings policies
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can insert site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can delete site settings" ON site_settings;

-- ============================================
-- 9. CREATE NEW POLICIES
-- ============================================

-- ===== EVENT CATEGORIES POLICIES =====
CREATE POLICY "Anyone can view event categories"
  ON event_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert event categories"
  ON event_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update event categories"
  ON event_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete event categories"
  ON event_categories FOR DELETE
  TO authenticated
  USING (true);

-- ===== SLIDES POLICIES =====
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

-- ===== TEAM MEMBERS POLICIES =====
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

-- ===== EVENTS POLICIES =====
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

-- ===== GALLERY ITEMS POLICIES =====
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

-- ===== SITE SETTINGS POLICIES =====
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site settings"
  ON site_settings FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 10. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS event_categories_name_idx ON event_categories(name);
CREATE INDEX IF NOT EXISTS slides_order_idx ON slides(order_index);
CREATE INDEX IF NOT EXISTS slides_active_idx ON slides(is_active);
CREATE INDEX IF NOT EXISTS team_members_order_idx ON team_members(order_index);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(event_date);
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category_id);
CREATE INDEX IF NOT EXISTS events_published_idx ON events(is_published);
CREATE INDEX IF NOT EXISTS gallery_items_order_idx ON gallery_items(order_index);
CREATE INDEX IF NOT EXISTS gallery_items_category_idx ON gallery_items(category);
CREATE INDEX IF NOT EXISTS site_settings_key_idx ON site_settings(key);

-- ============================================
-- 11. INSERT DEFAULT DATA
-- ============================================

-- Insert default event categories
INSERT INTO event_categories (name, label)
VALUES 
  ('workshop', 'Workshop'),
  ('bootcamp', 'Bootcamp'),
  ('networking', 'Jaringan'),
  ('conference', 'Konferensi')
ON CONFLICT (name) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value)
VALUES 
  ('member_registration_url', 'https://forms.google.com/member-registration'),
  ('event_registration_url', 'https://forms.google.com/event-registration'),
  ('admin_notification_email', 'admin@hmpti.edu')
ON CONFLICT (key) DO NOTHING;