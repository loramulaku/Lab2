-- ============================================================
--  Job Portal — full schema
--  Run once against an empty database: jobportal_db
--  All ALTER TABLE additions from later migrations are already
--  folded into the CREATE TABLE statements below.
-- ============================================================

CREATE DATABASE IF NOT EXISTS jobportal_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE jobportal_db;

-- ── 1. Independent tables (no foreign-key deps) ──────────────

CREATE TABLE Users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(100),
  last_name     VARCHAR(100),
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Roles (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE
);

CREATE TABLE Permissions (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE
);

CREATE TABLE Companies (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  website     VARCHAR(255),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Skills (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE
);

CREATE TABLE Categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE Conversations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Plans (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50) UNIQUE,
  price         DECIMAL(10, 2),
  job_limit     INT,
  duration_days INT NOT NULL DEFAULT 30
);

-- ── 2. Tables with one dependency ────────────────────────────

CREATE TABLE UserRoles (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  role_id INT,
  UNIQUE KEY uq_user_role (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES Roles(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE RolePermissions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  role_id       INT,
  permission_id INT,
  UNIQUE KEY uq_role_permission (role_id, permission_id),
  FOREIGN KEY (role_id)       REFERENCES Roles(id)       ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES Permissions(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE RefreshTokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  token      TEXT,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE AuditLogs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  action     VARCHAR(255),
  entity     VARCHAR(100),
  old_value  TEXT,
  new_value  TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  type       VARCHAR(100),
  message    TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Settings (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  `key`   VARCHAR(100),
  value   TEXT,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Files (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  file_url   TEXT,
  file_type  VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE CandidateProfiles (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT UNIQUE,
  headline VARCHAR(255),
  bio      TEXT,
  location VARCHAR(150),
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE RecruiterProfiles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNIQUE,
  company_id INT,
  FOREIGN KEY (user_id)    REFERENCES Users(id)     ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES Companies(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Reports (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100),
  filters    TEXT,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- ── 3. Subscriptions & Payments ──────────────────────────────

CREATE TABLE Subscriptions (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  company_id             INT,
  plan_id                INT,
  stripe_subscription_id VARCHAR(255),
  status                 VARCHAR(50),
  current_period_end     DATETIME,
  jobs_posted_count      INT NOT NULL DEFAULT 0,
  FOREIGN KEY (company_id) REFERENCES Companies(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (plan_id)    REFERENCES Plans(id)     ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Payments (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  company_id               INT,
  subscription_id          INT,
  stripe_payment_intent_id VARCHAR(255),
  amount                   DECIMAL(10, 2),
  status                   VARCHAR(50),
  created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id)      REFERENCES Companies(id)    ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (subscription_id) REFERENCES Subscriptions(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- ── 4. Jobs & related ────────────────────────────────────────

CREATE TABLE Jobs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  company_id       INT,
  recruiter_id     INT,
  title            VARCHAR(255),
  description      TEXT,
  employment_type  VARCHAR(50),
  experience_level ENUM('junior', 'mid', 'senior'),
  work_mode        VARCHAR(50),
  job_mode         VARCHAR(50),
  budget_min       DECIMAL(10, 2),
  budget_max       DECIMAL(10, 2),
  expires_at       DATETIME,
  deadline         DATETIME,
  status           VARCHAR(50),
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id)   REFERENCES Companies(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (recruiter_id) REFERENCES Users(id)     ON DELETE SET NULL
);

CREATE TABLE Applications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  job_id     INT,
  user_id    INT,
  stage_id   INT,
  status     VARCHAR(50),
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)  REFERENCES Jobs(id)  ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Pipelines (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT,
  name   VARCHAR(100),
  FOREIGN KEY (job_id) REFERENCES Jobs(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE PipelineStages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pipeline_id INT,
  name        VARCHAR(100),
  order_index INT,
  FOREIGN KEY (pipeline_id) REFERENCES Pipelines(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE StageHistory (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT,
  from_stage_id  INT,
  to_stage_id    INT,
  changed_by     INT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES Applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (changed_by)     REFERENCES Users(id)        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE JobSkills (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  job_id   INT,
  skill_id INT,
  UNIQUE KEY uq_job_skill (job_id, skill_id),
  FOREIGN KEY (job_id)   REFERENCES Jobs(id)   ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES Skills(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE JobCategories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  job_id      INT,
  category_id INT,
  UNIQUE KEY uq_job_category (job_id, category_id),
  FOREIGN KEY (job_id)      REFERENCES Jobs(id)       ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Categories(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Bids (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  job_id             INT,
  freelancer_id      INT,
  price              DECIMAL(10, 2),
  message            TEXT,
  status             VARCHAR(50),
  delivery_time_days INT,
  FOREIGN KEY (job_id)        REFERENCES Jobs(id)  ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Contracts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  job_id        INT,
  freelancer_id INT,
  company_id    INT,
  bid_id        INT,
  agreed_price  DECIMAL(10, 2),
  price         DECIMAL(10, 2),
  start_date    DATE,
  end_date      DATE,
  status        VARCHAR(50),
  FOREIGN KEY (job_id)        REFERENCES Jobs(id)       ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES Users(id)      ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (company_id)    REFERENCES Companies(id)  ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (bid_id)        REFERENCES Bids(id)       ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Invitations (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  company_id         INT,
  freelancer_id      INT,
  job_id             INT,
  message            TEXT,
  price_offer        DECIMAL(10, 2),
  delivery_time_days INT,
  status             VARCHAR(50),
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id)    REFERENCES Companies(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES Users(id)     ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (job_id)        REFERENCES Jobs(id)      ON UPDATE CASCADE ON DELETE SET NULL
);

-- ── 5. Messaging ─────────────────────────────────────────────

CREATE TABLE ConversationParticipants (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT,
  user_id         INT,
  UNIQUE KEY uq_conv_participant (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES Conversations(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id)         REFERENCES Users(id)         ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT,
  sender_id       INT,
  message         TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES Conversations(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (sender_id)       REFERENCES Users(id)         ON UPDATE CASCADE ON DELETE SET NULL
);

-- ── 6. Misc ───────────────────────────────────────────────────

CREATE TABLE CandidateSkills (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT,
  skill_id INT,
  level    VARCHAR(50),
  UNIQUE KEY uq_candidate_skill (user_id, skill_id),
  FOREIGN KEY (user_id)  REFERENCES Users(id)  ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES Skills(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  reviewer_id INT,
  reviewed_id INT,
  rating      INT,
  comment     TEXT,
  FOREIGN KEY (reviewer_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (reviewed_id) REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Exports (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  report_id  INT,
  type       VARCHAR(50),
  file_path  TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES Users(id)   ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (report_id) REFERENCES Reports(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ── 7. Seed data (optional — delete if not needed) ───────────

INSERT INTO Roles (name) VALUES ('admin'), ('recruiter'), ('candidate');

INSERT INTO Plans (name, price, job_limit, duration_days) VALUES
  ('Starter', 29.99,  5,  30),
  ('Pro',     79.99,  20, 30),
  ('Elite',   149.99, 50, 30);

INSERT INTO Skills (name) VALUES
  ('JavaScript'), ('TypeScript'), ('Node.js'), ('React'),
  ('Python'), ('SQL'), ('MongoDB'), ('Docker');

INSERT INTO Categories (name) VALUES
  ('Software Development'), ('Design'), ('Marketing'),
  ('Data Science'), ('DevOps'), ('Management');
