/*
  # Sistem Absensi dengan QR Code

  1. New Tables
    - `attendance_events`
      - `id` (uuid, primary key)
      - `event_name` (text) - Nama kegiatan
      - `event_date` (date) - Tanggal kegiatan
      - `event_type` (text) - Tipe event
      - `qr_code_senior` (text) - QR code untuk senior
      - `qr_code_umum` (text) - QR code untuk peserta umum
      - `qr_code_panitia` (text) - QR code untuk panitia
      - `spreadsheet_url_senior` (text) - Link Google Sheets untuk senior
      - `spreadsheet_url_umum` (text) - Link Google Sheets untuk umum
      - `spreadsheet_url_panitia` (text) - Link Google Sheets untuk panitia
      - `is_active` (boolean) - Status aktif
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `attendance_events` table
    - Add policies for authenticated users to manage attendance events
*/

CREATE TABLE IF NOT EXISTS attendance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'general',
  qr_code_senior text NOT NULL,
  qr_code_umum text NOT NULL,
  qr_code_panitia text NOT NULL,
  spreadsheet_url_senior text,
  spreadsheet_url_umum text,
  spreadsheet_url_panitia text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active attendance events"
  ON attendance_events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert attendance events"
  ON attendance_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance events"
  ON attendance_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance events"
  ON attendance_events FOR DELETE
  TO authenticated
  USING (true);