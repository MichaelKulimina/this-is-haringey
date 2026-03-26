-- ============================================================
-- Migration 001: Create all tables
-- This Is Haringey — Community Platform
-- ============================================================

-- -----------------------------------------------
-- Utility: auto-update updated_at on row change
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------
-- Table: categories
-- Event subcategory taxonomy
-- -----------------------------------------------
CREATE TABLE categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  slug       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------
-- Table: venues
-- Normalised venue reference (for future use)
-- Submissions/events store venue fields directly
-- -----------------------------------------------
CREATE TABLE venues (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  address        TEXT        NOT NULL,
  postcode       TEXT,
  neighbourhood  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------
-- Table: organisers
-- 1:1 with auth.users; created via trigger on sign-up
-- -----------------------------------------------
CREATE TABLE organisers (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT        NOT NULL DEFAULT '',
  organisation_name TEXT,
  email             TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER organisers_updated_at
  BEFORE UPDATE ON organisers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-create organiser profile on auth.users INSERT
-- Skips creation for admin accounts (role set in app_metadata)
CREATE OR REPLACE FUNCTION handle_new_organiser()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(NEW.raw_app_meta_data->>'role', '') != 'admin' THEN
    INSERT INTO public.organisers (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_organiser();


-- -----------------------------------------------
-- Table: submissions
-- Staging table — events pending admin review
-- -----------------------------------------------
CREATE TABLE submissions (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name                TEXT        NOT NULL,
  short_description         TEXT        NOT NULL,
  full_description          TEXT,
  image_url                 TEXT,
  image_thumb_url           TEXT,
  category_id               UUID        REFERENCES categories(id),
  event_date_start          DATE        NOT NULL,
  event_date_end            DATE,
  start_time                TIME        NOT NULL,
  end_time                  TIME,
  venue_name                TEXT        NOT NULL,
  venue_address             TEXT        NOT NULL,
  neighbourhood             TEXT,
  ticket_price              TEXT        NOT NULL,
  ticket_url                TEXT,
  organiser_id              UUID        REFERENCES organisers(id),
  organiser_name            TEXT        NOT NULL,
  organiser_email           TEXT        NOT NULL,
  accessibility_info        TEXT,
  borough_of_culture        BOOLEAN     NOT NULL DEFAULT FALSE,
  status                    TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','approved','returned','rejected','withdrawn')),
  admin_feedback            TEXT,
  stripe_payment_intent_id  TEXT,
  stripe_charge_id          TEXT,
  submitter_ip              TEXT,
  privacy_consent           BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX submissions_status_idx      ON submissions (status);
CREATE INDEX submissions_category_idx    ON submissions (category_id);
CREATE INDEX submissions_organiser_idx   ON submissions (organiser_id);
CREATE INDEX submissions_created_at_idx  ON submissions (created_at DESC);

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- -----------------------------------------------
-- Table: events
-- Published listings only — denormalised from submissions
-- -----------------------------------------------
CREATE TABLE events (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id     UUID        REFERENCES submissions(id),
  event_name        TEXT        NOT NULL,
  short_description TEXT        NOT NULL,
  full_description  TEXT,
  image_url         TEXT,
  image_thumb_url   TEXT,
  category_id       UUID        REFERENCES categories(id),
  event_date_start  DATE        NOT NULL,
  event_date_end    DATE,
  start_time        TIME        NOT NULL,
  end_time          TIME,
  venue_name        TEXT        NOT NULL,
  venue_address     TEXT        NOT NULL,
  neighbourhood     TEXT,
  ticket_price      TEXT        NOT NULL,
  ticket_url        TEXT,
  organiser_id      UUID        REFERENCES organisers(id),
  organiser_name    TEXT        NOT NULL,
  accessibility_info TEXT,
  borough_of_culture BOOLEAN    NOT NULL DEFAULT FALSE,
  status            TEXT        NOT NULL DEFAULT 'published'
                      CHECK (status IN ('published','withdrawn')),
  published_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX events_category_idx           ON events (category_id);
CREATE INDEX events_date_start_idx         ON events (event_date_start);
CREATE INDEX events_status_idx             ON events (status);
CREATE INDEX events_borough_of_culture_idx ON events (borough_of_culture) WHERE borough_of_culture = TRUE;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- -----------------------------------------------
-- Table: payments
-- Financial audit log — server-side insert only
-- Retain 7 years per HMRC requirement
-- -----------------------------------------------
CREATE TABLE payments (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id             UUID        REFERENCES submissions(id),
  organiser_id              UUID        REFERENCES organisers(id),
  organiser_name            TEXT        NOT NULL,
  organiser_email           TEXT        NOT NULL,
  event_name                TEXT        NOT NULL,
  amount_pence              INTEGER     NOT NULL DEFAULT 1000,
  currency                  TEXT        NOT NULL DEFAULT 'gbp',
  stripe_payment_intent_id  TEXT        NOT NULL,
  stripe_charge_id          TEXT,
  status                    TEXT        NOT NULL DEFAULT 'succeeded'
                              CHECK (status IN ('succeeded','refunded')),
  submitter_ip              TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX payments_submission_idx  ON payments (submission_id);
CREATE INDEX payments_organiser_idx   ON payments (organiser_id);


-- -----------------------------------------------
-- Table: subscriptions
-- Public visitor email subscriptions — GDPR-sensitive
-- -----------------------------------------------
CREATE TABLE subscriptions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email              TEXT        NOT NULL UNIQUE,
  categories         UUID[]      NOT NULL,
  verified           BOOLEAN     NOT NULL DEFAULT FALSE,
  verification_token UUID        NOT NULL DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at    TIMESTAMPTZ
);

CREATE INDEX subscriptions_email_idx              ON subscriptions (email);
CREATE INDEX subscriptions_verification_token_idx ON subscriptions (verification_token);
CREATE INDEX subscriptions_verified_idx           ON subscriptions (verified) WHERE verified = TRUE;
