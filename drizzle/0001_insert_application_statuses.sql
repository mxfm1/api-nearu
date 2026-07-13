-- Insert application statuses with proper UUIDs
-- These are separate from event/service statuses

INSERT INTO statuses (id, name, slug) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Application Pending', 'application_pending'),
  ('10000000-0000-0000-0000-000000000002', 'Application Reviewing', 'application_reviewing'),
  ('10000000-0000-0000-0000-000000000003', 'Application Approved', 'application_approved'),
  ('10000000-0000-0000-0000-000000000004', 'Application Rejected', 'application_rejected')
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT * FROM statuses;
