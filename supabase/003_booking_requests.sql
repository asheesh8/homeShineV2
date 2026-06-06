-- Client-facing booking requests table
-- Clients submit these through the public /book portal.
-- Steven reviews and converts them to full assessments.

CREATE TABLE IF NOT EXISTS booking_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  street       TEXT,
  city         TEXT NOT NULL,
  state        TEXT NOT NULL DEFAULT 'VT',
  service_type TEXT NOT NULL CHECK (service_type IN ('consultation', 'assessment')),
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  message      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_date ON booking_requests (requested_date);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests (status);
