-- Database schema for Online Free Leave Manager
-- Works on local PostgreSQL and on Neon (both are PostgreSQL).

CREATE TABLE IF NOT EXISTS employees (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  department    VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  role          VARCHAR(20)  NOT NULL DEFAULT 'employee',
  password_hash TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT employees_role_check CHECK (role IN ('employee', 'hr'))
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id          SERIAL PRIMARY KEY,
  employee_id INTEGER     NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type  VARCHAR(20) NOT NULL,
  from_date   DATE        NOT NULL,
  to_date     DATE        NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leave_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT leave_type_check CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid')),
  CONSTRAINT leave_date_check CHECK (to_date >= from_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
