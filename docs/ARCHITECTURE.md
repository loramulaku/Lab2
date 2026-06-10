# Project Architecture Reference

This document covers three topics:
1. [Database structure](#1-database-structure)
2. [How authentication tokens work](#2-authentication-tokens)
3. [How role-based access is enforced](#3-role-based-access-control)

---

## 1. Database Structure

The project uses **two databases in parallel**:

| Database | Engine | Purpose |
|---|---|---|
| `jobportal_db` | MySQL | The write-side (source of truth). All mutations happen here. |
| `jobportal_read` | MongoDB | The read-side (projections / view models). Populated by async sync jobs after MySQL writes. |

The MySQL schema is defined in `backend/src/models/sql/`. Every model there maps to one table. The MongoDB collections are in `backend/src/models/nosql/`.

---

### MySQL Tables

#### Identity & Access

**`Users`**
The root table. Every person in the system (candidate, recruiter, admin) has exactly one row here.

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | Auto-increment |
| `first_name` | varchar(100) | |
| `last_name` | varchar(100) | |
| `email` | varchar(150) UNIQUE | Login credential |
| `password_hash` | varchar(255) | bcrypt, cost 10 |
| `is_active` | boolean | Soft-disable flag |
| `avatar_path` | varchar(500) | Path under `/public/uploads/` |
| `created_at` / `updated_at` | datetime | Auto-managed by Sequelize |

**`Roles`**
A lookup table of role names: `candidate`, `recruiter`, `admin`.

| Column | Type |
|---|---|
| `id` | int PK |
| `name` | varchar(50) UNIQUE |

**`UserRoles`** *(join table)*
Many-to-many bridge between `Users` and `Roles`. A user can have multiple roles.

| Column | Type | FK |
|---|---|---|
| `user_id` | int | → `Users.id` |
| `role_id` | int | → `Roles.id` |

**`RefreshTokens`**
One row per active browser session (see [section 2](#2-authentication-tokens)).

| Column | Type | Notes |
|---|---|---|
| `user_id` | int FK → `Users.id` | Owner |
| `token` | text | 40-byte random hex |
| `expires_at` | datetime | Login + 7 days |

---

#### Candidate Profile

**`CandidateProfiles`**
One row per candidate user. Stores the reusable profile data that pre-fills application and bid forms.

| Column | Type | Notes |
|---|---|---|
| `user_id` | int UNIQUE FK → `Users.id` | One-to-one |
| `headline` | varchar(255) | Short title (e.g. "Full-Stack Developer") |
| `bio` | text | |
| `location` | varchar(150) | |
| `freelance_active` | boolean | True = this candidate is also a freelancer |
| `phone` | varchar(50) | |
| `cv_path` | varchar(500) | Uploaded CV file path |
| `willing_to_relocate` | boolean | |
| `years_experience` | int | |
| `linkedin_url` / `github_url` / `portfolio_url` | varchar(255) | Optional links |

**`Skills`**
Global skill catalogue (e.g. "React", "Python").

| Column | Type |
|---|---|
| `id` | int PK |
| `name` | varchar(100) UNIQUE |

**`CandidateSkills`** *(join table)*
A candidate's skill set with a proficiency level.

| Column | Type | FK |
|---|---|---|
| `user_id` | int | → `Users.id` |
| `skill_id` | int | → `Skills.id` |
| `level` | varchar(50) | e.g. "Expert", "Intermediate" |

**`Experiences`**
Work history entries for a candidate.

| Column | Type | Notes |
|---|---|---|
| `user_id` | int FK → `Users.id` | |
| `title` | varchar(255) | Job title |
| `company` | varchar(255) | |
| `start_date` | date | |
| `end_date` | date | NULL = current role |
| `description` | text | |

**`Educations`**
Education history entries for a candidate.

| Column | Type |
|---|---|
| `user_id` | int FK → `Users.id` |
| `degree` | varchar(255) |
| `institution` | varchar(255) |
| `start_year` / `end_year` | smallint |

---

#### Recruiter & Company

**`Companies`**
One company can have one or more recruiters.

| Column | Type |
|---|---|
| `id` | int PK |
| `name` | varchar(150) |
| `industry` | varchar(150) |
| `location` | varchar(150) |
| `size` | varchar(50) |
| `founded_year` | smallint |
| `logo_path` | varchar(500) |
| `website` | varchar(255) |
| `description` | text |
| `stripe_customer_id` | varchar(255) |

**`RecruiterProfiles`**
One row per recruiter user, linking them to their company.

| Column | Type | FK |
|---|---|---|
| `user_id` | int UNIQUE | → `Users.id` |
| `company_id` | int | → `Companies.id` |
| `job_title` | varchar(150) | Recruiter's own job title |
| `phone` | varchar(50) | |
| `linkedin_url` | varchar(500) | |

---

#### Jobs

**`Jobs`**
Every job posting in the system.

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `company_id` | int FK → `Companies.id` | Owner company |
| `recruiter_id` | int FK → `Users.id` | The recruiter who posted it |
| `title` | varchar(255) | |
| `description` | text | |
| `employment_type` | varchar(50) | `full-time`, `part-time`, `freelance` |
| `work_mode` | varchar(50) | `remote`, `hybrid`, `on-site` |
| `job_mode` | varchar(50) | `public`, `invite`, `both` (freelance only) |
| `experience_level` | enum | `junior`, `mid`, `senior` |
| `budget_min` / `budget_max` | decimal(10,2) | Salary or freelance budget |
| `status` | varchar(50) | `open`, `closed`, `archived` |
| `expires_at` / `deadline` | datetime | |
| `responsibilities` / `requirements` / `nice_to_have` / `benefits` / `schedule` | text/json | Rich description fields |
| `closed_at` / `archived_at` | datetime | |

**`JobSkills`** *(join table)*
Skills required for a job.

| Column | FK |
|---|---|
| `job_id` | → `Jobs.id` |
| `skill_id` | → `Skills.id` |

**`JobCategories`** *(join table)*
Categories a job belongs to.

| Column | FK |
|---|---|
| `job_id` | → `Jobs.id` |
| `category_id` | → `Categories.id` |

**`Categories`**
Job category labels (e.g. "Engineering", "Design").

| Column | Type |
|---|---|
| `id` | int PK |
| `name` | varchar(100) |

**`saved_jobs`**
Jobs a candidate has bookmarked.

| Column | FK |
|---|---|
| `user_id` | → `Users.id` |
| `job_id` | → `Jobs.id` |

---

#### Applications (Standard Hiring)

**`Applications`**
Tracks a candidate's submission to a specific job. One application per candidate-job pair (unique constraint on `user_id + job_id`).

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `job_id` | int FK → `Jobs.id` | |
| `user_id` | int FK → `Users.id` | The candidate |
| `stage_id` | int FK → `PipelineStages.id` | Current pipeline stage |
| `status` | varchar(50) | `pending`, `rejected`, `hired` |
| `applied_at` | datetime | |
| `interview_at` | datetime | Scheduled interview time |
| `cover_letter` | text | |
| `expected_salary` | decimal | |
| `cv_path` | varchar(500) | Snapshot of CV at time of apply |
| `skills_snapshot` | json | Skills at time of apply |
| `screening_answers` | json | Answers to custom questions |

---

#### Pipeline (Recruiter Kanban)

**`Pipelines`**
Each company has one pipeline. Loosely linked to a job (optional `job_id`).

| Column | Type | FK |
|---|---|---|
| `id` | int PK | |
| `company_id` | int | → `Companies.id` |
| `job_id` | int | → `Jobs.id` (optional) |
| `name` | varchar(100) | |

**`PipelineStages`**
The stages of a pipeline (e.g. "CV Review", "Technical Interview"). Ordered by `order_index`.

| Column | Type | Notes |
|---|---|---|
| `pipeline_id` | int FK → `Pipelines.id` | |
| `name` | varchar(100) | |
| `order_index` | int | Sort order |
| `has_calendar` | boolean | Whether to show a calendar picker |

**`PipelineNotes`**
A note written by the recruiter when moving a candidate to a stage. This note is also sent as a notification to the candidate.

| Column | Type | FK |
|---|---|---|
| `application_id` | int | → `Applications.id` |
| `stage_id` | int | → `PipelineStages.id` |
| `note` | text | |
| `interview_at` | datetime | Optional interview date |
| `created_by` | int | → `Users.id` (recruiter) |

**`StageHistory`**
Immutable audit trail of every stage transition.

| Column | FK |
|---|---|
| `application_id` | → `Applications.id` |
| `from_stage_id` | → `PipelineStages.id` |
| `to_stage_id` | → `PipelineStages.id` |
| `changed_by` | → `Users.id` |

---

#### Freelance Hiring Flow

The freelance flow has **two sub-paths**:

- **Type A (Invitation):** Recruiter invites a freelancer directly → freelancer confirms → recruiter sends contract.
- **Type B (Bid):** Freelancer discovers a public job and submits a bid → recruiter accepts and sends contract.

Both converge at the `Contracts` table.

**`Bids`**
A freelancer's bid on a public freelance job. One bid per freelancer-job pair.

| Column | Type | Notes |
|---|---|---|
| `job_id` | int FK → `Jobs.id` | |
| `freelancer_id` | int FK → `Users.id` | The candidate/freelancer |
| `price` | decimal | Proposed price |
| `bid_type` | enum | `fixed`, `hourly` |
| `delivery_time_days` | int | |
| `hours_per_week` | int | (hourly bids) |
| `status` | varchar(50) | `pending`, `accepted`, `rejected`, `withdrawn` |
| `message` / `cover_letter` | text | |
| `milestones` / `portfolio_links` / `skills_snapshot` | json | |

**`Invitations`**
A recruiter's direct invitation to a specific freelancer for a specific job.

| Column | Type | Notes |
|---|---|---|
| `company_id` | int FK → `Companies.id` | |
| `freelancer_id` | int FK → `Users.id` | Target freelancer |
| `job_id` | int FK → `Jobs.id` | Optional (invite-only jobs) |
| `title` | varchar(255) | Invitation subject |
| `message` | text | Personal message |
| `price_offer` | decimal | Recruiter's offer |
| `delivery_time_days` | int | |
| `status` | varchar(50) | `pending`, `confirmed`, `accepted`, `rejected`, `revoked` |
| `responded_at` | datetime | When the freelancer responded |

**`Contracts`**
Created by the recruiter. Activated (status → `active`) when the freelancer approves.
Works for all three sources: bid, invitation, and pipeline.

| Column | Type | Notes |
|---|---|---|
| `job_id` | int FK → `Jobs.id` | |
| `freelancer_id` | int FK → `Users.id` | Candidate or freelancer |
| `company_id` | int FK → `Companies.id` | |
| `bid_id` | int FK → `Bids.id` | Set when `source = 'bid'` |
| `invitation_id` | int FK → `Invitations.id` | Set when `source = 'invitation'` |
| `application_id` | int FK → `Applications.id` | Set when `source = 'pipeline'` |
| `source` | varchar(20) | `bid`, `invitation`, `pipeline` |
| `agreed_price` | decimal | Final agreed amount |
| `start_date` / `end_date` | date | |
| `status` | varchar(50) | `pending`, `active`, `rejected` |
| `active_key` | varchar(32) | Unique constraint (`job:{jobId}`) prevents two active contracts per job |
| `approved_at` | datetime | When freelancer accepted |

---

#### Subscriptions & Billing

**`Plans`**
Pricing tiers (e.g. Basic, Pro, Mega).

| Column | Type |
|---|---|
| `name` | varchar(50) UNIQUE |
| `price` | decimal |
| `billing_interval` | enum: `month`, `year` |
| `job_limit` | int |
| `stripe_price_id` | varchar(255) |
| `is_active` | boolean |

**`Subscriptions`**
One active subscription per company.

| Column | FK / Type | Notes |
|---|---|---|
| `company_id` | → `Companies.id` | |
| `plan_id` | → `Plans.id` | |
| `stripe_subscription_id` | varchar(255) | Stripe's subscription ID |
| `status` | varchar(50) | `active`, `past_due`, `cancelled` |
| `current_period_end` | datetime | |
| `cancel_at_period_end` | boolean | |

**`Payments`**
One row per successful Stripe payment intent.

| Column | FK |
|---|---|
| `company_id` | → `Companies.id` |
| `plan_id` | → `Plans.id` |
| `user_id` | → `Users.id` |
| `stripe_payment_intent_id` | varchar(255) |
| `amount` / `currency` / `status` / `payment_method` | — |

---

#### Messaging

**`Conversations`**
A chat thread between two or more users.

| Column | Type |
|---|---|
| `id` | int PK |
| `created_at` | datetime |

**`ConversationParticipants`** *(join table)*
Who is in each conversation. Unique per `(conversation_id, user_id)`.

| Column | FK |
|---|---|
| `conversation_id` | → `Conversations.id` |
| `user_id` | → `Users.id` |

**`Messages`**
Individual messages inside a conversation.

| Column | FK / Type | Notes |
|---|---|---|
| `conversation_id` | → `Conversations.id` | |
| `sender_id` | → `Users.id` | |
| `message` | text | |
| `is_read` | boolean | |

---

#### Notifications

**`Notifications`**
System-generated notifications delivered in-app (and via Socket.IO in real-time).

| Column | Type | Notes |
|---|---|---|
| `user_id` | int FK → `Users.id` | Recipient |
| `application_id` | int FK → `Applications.id` | Linked application (nullable) — used as a gate key for pipeline moves |
| `type` | varchar(100) | e.g. `pipeline_stage_change`, `contract_offer`, `contract_accepted` |
| `title` | varchar(255) | Short heading |
| `message` | text | Full text |
| `link` | varchar(500) | Deep-link the user should navigate to |
| `is_read` | boolean | The recruiter cannot move a candidate to the next pipeline stage until the candidate marks the related `pipeline_stage_change` notification as read |

---

#### System / Admin Tables

**`AuditLogs`** — Records sensitive actions (login, user create, delete, etc.) with before/after values and IP address.

**`FailedSync`** — Rows inserted when a MySQL → MongoDB sync job throws, so failed syncs can be retried.

**`Export`** — Tracks bulk export requests (e.g. candidate list CSV).

**`Report`** / **`Review`** — User-reported content and peer reviews.

**`Setting`** / **`Theme`** — Admin-configurable site settings and UI themes.

**`File`** — Generic file upload registry.

**`Permission`** / **`RolePermission`** — Fine-grained permission table (provisioned but currently enforced primarily through the `role` middleware).

---

### Relationship Map

```
Users ──────────────────────────────┐
  │                                  │
  ├─< UserRoles >── Roles            │ (many-to-many via join table)
  │                                  │
  ├── CandidateProfile (1:1)         │
  │     ├─< CandidateSkills >── Skills
  │     ├─< Experiences              │
  │     └─< Educations               │
  │                                  │
  ├── RecruiterProfile (1:1) ────────┤
  │     └── Company                  │
  │           ├─< Jobs               │
  │           │     ├─< JobSkills >── Skills
  │           │     ├─< JobCategories >── Categories
  │           │     ├─< Applications ── Users (candidate)
  │           │     │     └── PipelineStage (current stage)
  │           │     ├─< Bids ── Users (freelancer)
  │           │     └─< Invitations ── Users (freelancer)
  │           ├─< Pipelines
  │           │     └─< PipelineStages
  │           ├─< Contracts ── Users (freelancer)
  │           │     ├── Bids (optional)
  │           │     ├── Invitations (optional)
  │           │     └── Applications (optional)
  │           ├─< Subscriptions ── Plans
  │           └─< Payments ── Plans
  │
  ├─< Notifications
  ├─< RefreshTokens
  ├─< ConversationParticipants >── Conversations
  │                                     └─< Messages
  └─< SavedJobs >── Jobs
```

---

### MongoDB Read Collections

These are populated automatically after every MySQL write via async "sync" functions (e.g. `syncApplicationSafe`, `syncContractSafe`). They are **read-only** from the application's perspective — all writes go to MySQL first.

| Collection | What it mirrors |
|---|---|
| `applicationviews` | Applications with candidate + job details flattened in |
| `candidateviews` | Candidate profiles with skills, experience, education |
| `contractviews` | Contracts with freelancer + company + job details |
| `notificationviews` | Notifications with user info |
| `jobviews` | Jobs with company and skills |
| `recruiterview` | Recruiter profiles |
| `userprofileview` | Basic user info |

---

## 2. Authentication Tokens

The project uses a **dual-token** system: a short-lived **access token** (JWT) and a long-lived **refresh token** (opaque random string stored in the database).

### Access Token

| Property | Value |
|---|---|
| Format | JSON Web Token (JWT), signed with `HS256` |
| Secret | `JWT_SECRET` environment variable |
| Lifetime | **15 minutes** (`JWT_ACCESS_EXPIRES=15m`) |
| Payload | `{ id, email, roles, companyId }` |
| Transport | `Authorization: Bearer <token>` header on every API request |
| Client storage | `localStorage` (key: `token`) + an in-memory `tokenRef` inside `frontend/src/services/api.js` |

The payload includes `roles` (array of role names) and `companyId` (for recruiters) so every authenticated request has instant role/company context without a database lookup.

#### Where it is generated

`backend/src/controllers/user.controller.js` — `signAccess()` helper:

```js
function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  });
}
```

Called on `POST /api/users/login` and `POST /api/users/refresh`.

#### Where it is verified

`backend/src/middlewares/auth.js`:

```js
req.user = jwt.verify(token, process.env.JWT_SECRET);
```

If the token is missing, malformed, or expired, the middleware returns `401 Unauthorized` immediately. No database hit is needed.

---

### Refresh Token

| Property | Value |
|---|---|
| Format | 40-byte random hex string (`crypto.randomBytes(40).toString('hex')`) |
| Lifetime | **7 days** |
| Transport | `HttpOnly` cookie (`refreshToken`), `SameSite: lax`, `Secure` in production |
| Server storage | `RefreshTokens` table in MySQL (one row per active session) |

Because the refresh token is `HttpOnly`, JavaScript on the page cannot read it. This limits the damage if a page has an XSS vulnerability.

#### Token rotation (single-use)

Every call to `POST /api/users/refresh`:
1. Looks up the token in the `RefreshTokens` table.
2. Checks `expires_at` is in the future.
3. **Deletes the old row** (`stored.destroy()`).
4. Creates a brand-new refresh token row.
5. Returns a new access token + sets a new refresh cookie.

This means each refresh token is single-use. Replaying a stolen token after it has been rotated will fail with `401`.

#### Full flow diagram

```
Browser                              Backend
──────                               ───────
POST /users/login
  email + password          ──────►  Verify bcrypt
                                      Build JWT payload { id, roles, companyId }
                            ◄──────  { token: <accessJWT> }  +  Set-Cookie: refreshToken=<hex>
  Store token in localStorage
  Store tokenRef.current = token

Every API request:
  Authorization: Bearer <token>  ──► auth middleware: jwt.verify()
                                      → attach req.user, continue

15 min later — token expires:
  API returns 401             ◄──── 401 Unauthorized

  (Axios interceptor catches it)
  POST /users/refresh
  (sends cookie automatically) ──► Find RefreshToken row in DB
                                    Rotate (delete old, create new)
                                    Sign new access token
                            ◄───── { token: <newAccessJWT> }  +  Set-Cookie: new refreshToken
  Retry original request with new token

Logout:
POST /users/logout           ──────► Delete RefreshToken row from DB
                             ◄──────  Clear-Cookie refreshToken
  Remove token from localStorage
```

#### Proactive refresh (frontend)

The `AuthContext` (`frontend/src/context/AuthContext.jsx`) schedules a `setTimeout` to fire **60 seconds before** the access token expires. When it fires, `silentRefresh()` calls `POST /users/refresh` proactively so the user never hits a 401 in the middle of an action.

Additional triggers:
- **Tab visibility change** — when the user switches back to the tab, the token is re-validated; if it expired in the background, a silent refresh is triggered.
- **`localStorage` event** — fires when another tab or DevTools modifies the stored token.

---

## 3. Role-Based Access Control

### The Roles

| Role | Who has it | Notes |
|---|---|---|
| `candidate` | Job seekers and freelancers | A freelancer is a candidate with `CandidateProfile.freelance_active = true`. There is no separate "freelancer" role in the database. |
| `recruiter` | Hiring-company users | Must also complete company setup (creates a `RecruiterProfile` row) to post jobs |
| `admin` | Platform administrators | Assigned manually; has full access to everything |

A user can technically have multiple roles (the `UserRoles` table is many-to-many), but in practice users are either candidate or recruiter.

---

### How It Works in Code

Access control is split across two middleware layers, applied **in this order** on every protected route:

#### Layer 1 — `auth` middleware
**File:** `backend/src/middlewares/auth.js`

Reads the `Authorization: Bearer <token>` header, verifies the JWT signature and expiry, and attaches the decoded payload to `req.user`:

```js
req.user = jwt.verify(token, process.env.JWT_SECRET);
// → req.user = { id, email, roles: ['candidate'], companyId: undefined }
```

Returns `401` if the token is missing or invalid. Every protected route must pass through `auth` first.

#### Layer 2 — `role(...)` middleware
**File:** `backend/src/middlewares/role.js`

Takes a list of allowed roles and checks whether `req.user.roles` includes at least one of them:

```js
function role(...allowedRoles) {
  return (req, res, next) => {
    const hasRole = allowedRoles.some(r => req.user.roles.includes(r));
    if (!hasRole) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
```

Returns `403` if the user's roles do not match. The roles come from the JWT payload — **no database query is needed** at check time.

#### Special case — `isAdmin` middleware
**File:** `backend/src/middlewares/isAdmin.js`

Used on the entire `/api/admin/` route group (via `router.use(isAdmin)`). Functionally equivalent to `role('admin')` but applied as a blanket guard for the whole admin section rather than per-route.

---

### Route Permissions by Role

#### Public routes (no token required)

| Route | Description |
|---|---|
| `GET /api/jobs` | Browse all jobs |
| `GET /api/jobs/:id` | View a single job |
| `POST /api/users/register` | Create an account |
| `POST /api/users/login` | Log in |
| `POST /api/users/refresh` | Refresh access token |
| `POST /api/users/logout` | Log out |
| `POST /api/subscriptions/webhook` | Stripe webhook (uses its own HMAC signature) |

---

#### Candidate-only routes (`role('candidate')`)

| Route | Action |
|---|---|
| `GET /api/candidate/profile` | View own profile |
| `PUT /api/candidate/profile` | Edit own profile |
| `PUT /api/candidate/freelance` | Toggle freelance mode on/off |
| `POST /api/candidate/cv` | Upload CV |
| `POST /api/candidate/applications` | Apply to a job |
| `GET /api/candidate/applications` | View own applications |
| `GET /api/candidate/applications/:id/notes` | View pipeline notes from recruiter |
| `GET /api/candidate/saved-jobs` | View saved jobs |
| `POST /api/candidate/saved-jobs/:jobId` | Save a job |
| `DELETE /api/candidate/saved-jobs/:jobId` | Unsave a job |
| `POST /api/candidate/skills` | Add a skill |
| `DELETE /api/candidate/skills/:id` | Remove a skill |
| `POST /api/candidate/experiences` | Add work experience |
| `PUT/DELETE /api/candidate/experiences/:id` | Edit / delete experience |
| `POST /api/candidate/educations` | Add education |
| `PUT/DELETE /api/candidate/educations/:id` | Edit / delete education |
| `POST /api/jobs/:jobId/bids` | Submit a bid on a freelance job |
| `GET /api/me/bids` | View own bids |
| `PATCH /api/bids/:id/withdraw` | Withdraw a bid |
| `GET /api/me/invitations` | View received invitations |
| `POST /api/invitations/:id/confirm` | Confirm (acknowledge) invitation |
| `POST /api/invitations/:id/accept` | Accept invitation |
| `POST /api/invitations/:id/reject` | Reject invitation |
| `POST /api/contracts/:id/approve` | Accept a contract offer |
| `POST /api/contracts/:id/reject` | Reject a contract offer |
| `GET /api/contracts` | View own contracts |

---

#### Recruiter-only routes (`role('recruiter', 'admin')` unless noted)

| Route | Action |
|---|---|
| `POST /api/jobs` | Post a job (requires active subscription) |
| `PUT /api/jobs/:id` | Edit a job |
| `PATCH /api/jobs/:id/status` | Open / close / archive a job |
| `DELETE /api/jobs/:id` | Delete a job |
| `GET /api/recruiter/profile` | View own recruiter profile |
| `POST /api/recruiter/setup` | Create/link company profile |
| `POST /api/recruiter/logo` | Upload company logo |
| `GET /api/recruiter/jobs` | List own company's jobs |
| `GET /api/recruiter/applicants` | List candidates who applied |
| `GET /api/recruiter/freelancers` | List freelancers who bid |
| `GET /api/recruiter/candidates` | Browse all candidate profiles |
| `GET /api/pipeline/board` | View pipeline Kanban board |
| `POST /api/pipeline` | Create a pipeline |
| `PUT /api/pipeline` | Edit pipeline (resets stages) |
| `POST /api/pipeline/move` | Move candidate to next stage |
| `POST /api/pipeline/reject` | Reject an application |
| `POST /api/pipeline/note` | Add a note to an application |
| `GET /api/pipeline/notes` | View transition notes |
| `GET /api/freelancers/search` | Search freelancer profiles |
| `POST /api/invitations` | Send an invitation to a freelancer |
| `GET /api/jobs/:id/invitations` | List invitations for a job |
| `PATCH /api/invitations/:id/revoke` | Revoke a sent invitation |
| `GET /api/jobs/:id/bids` | View bids on a job |
| `POST /api/bids/:id/accept` | Accept a bid |
| `POST /api/bids/:id/reject` | Reject a bid |
| `POST /api/contracts` | Create a contract (pending) |
| `GET /api/contracts` | View own company's contracts |
| `POST /api/subscriptions/checkout` | Start Stripe checkout (recruiter only) |
| `GET /api/subscriptions/my` | View own subscription |
| `GET /api/subscriptions/my-invoices` | View invoices |
| `POST /api/subscriptions/cancel` | Cancel subscription |

---

#### Admin-only routes (`/api/admin/*`, blocked by `isAdmin`)

| Area | What admin can do |
|---|---|
| Users | List, get by ID, create, update, delete any user |
| Jobs | List, view, update, delete any job |
| Companies | List, view, update, delete any company |
| Applications | List all applications across all companies |
| Subscriptions | `GET /api/subscriptions` — view all subscriptions |
| Categories | Full CRUD on job categories |
| Themes | Create, update, and activate UI themes |
| Candidates | Browse all candidate profiles |
| Audit logs | View full audit trail |
| Payment logs | View all payments |
| Dashboard stats | Aggregate counts |

---

### Where to Find Each File

| What | Path |
|---|---|
| JWT sign & verify (login/refresh) | `backend/src/controllers/user.controller.js` |
| `auth` middleware | `backend/src/middlewares/auth.js` |
| `role` middleware | `backend/src/middlewares/role.js` |
| `isAdmin` middleware | `backend/src/middlewares/isAdmin.js` |
| User routes | `backend/src/routes/user.routes.js` |
| Candidate routes | `backend/src/routes/candidate.routes.js` |
| Recruiter routes | `backend/src/routes/recruiter.routes.js` |
| Job routes | `backend/src/routes/job.routes.js` |
| Pipeline routes | `backend/src/routes/pipeline.routes.js` |
| Bid routes | `backend/src/routes/bid.routes.js` |
| Invitation routes | `backend/src/routes/invitation.routes.js` |
| Contract routes | `backend/src/routes/contract.routes.js` |
| Subscription routes | `backend/src/routes/subscription.routes.js` |
| Admin routes | `backend/src/routes/admin.routes.js` |
| Frontend token management | `frontend/src/context/AuthContext.jsx` |
| Frontend Axios interceptor | `frontend/src/services/api.js` |
| All SQL models | `backend/src/models/sql/` |
| Model relationships | `backend/src/models/sql/associations.js` |
