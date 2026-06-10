'use strict';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'HireWire API',
    version: '1.0.0',
    description: `
**HireWire** is a full-stack job & freelance marketplace connecting candidates, recruiters, and admins.

## Authentication
Most endpoints require a **Bearer JWT** access token in the \`Authorization\` header.
Obtain one via \`POST /api/users/login\`. Access tokens expire; use \`POST /api/users/refresh\` (httpOnly cookie) to get a new one.

## Roles
| Role | Description |
|------|-------------|
| \`candidate\` | Job seeker / freelancer |
| \`recruiter\` | Company recruiter |
| \`admin\` | Platform administrator |

## Architecture
The backend follows **CQRS**: write operations go to MySQL, read queries go to MongoDB read-model projections.
    `.trim(),
    contact: {
      name: 'HireWire Team',
    },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local development server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from POST /api/users/login',
      },
    },
    schemas: {
      // ── Shared primitives ─────────────────────────────────────────────────
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized' },
          code:    { type: 'string', example: 'PIPELINE_EXISTS' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 120 },
          page:  { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
        },
      },
      // ── Auth ──────────────────────────────────────────────────────────────
      RegisterBody: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password', 'role'],
        properties: {
          firstName: { type: 'string', example: 'Arjana' },
          lastName:  { type: 'string', example: 'Krasniqi' },
          email:     { type: 'string', format: 'email', example: 'arjana@example.com' },
          password:  { type: 'string', minLength: 6, example: 'secret123' },
          role:      { type: 'string', enum: ['candidate', 'recruiter'], example: 'candidate' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', example: 'arjana@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id:        { type: 'integer' },
              firstName: { type: 'string' },
              lastName:  { type: 'string' },
              email:     { type: 'string' },
              roles:     { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      // ── Job ───────────────────────────────────────────────────────────────
      Job: {
        type: 'object',
        properties: {
          id:             { type: 'integer' },
          title:          { type: 'string', example: 'Senior React Developer' },
          description:    { type: 'string' },
          workMode:       { type: 'string', enum: ['remote', 'onsite', 'hybrid'] },
          employmentType: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'] },
          experienceLevel:{ type: 'string', enum: ['junior', 'mid', 'senior'] },
          status:         { type: 'string', enum: ['open', 'closed', 'archived'] },
          budgetMin:      { type: 'number', example: 1500 },
          budgetMax:      { type: 'number', example: 3000 },
          skills:         { type: 'array', items: { type: 'string' } },
          company:        { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
          createdAt:      { type: 'string', format: 'date-time' },
        },
      },
      JobBody: {
        type: 'object',
        required: ['title'],
        properties: {
          title:          { type: 'string', example: 'Senior React Developer' },
          description:    { type: 'string' },
          workMode:       { type: 'string', enum: ['remote', 'onsite', 'hybrid'], example: 'remote' },
          employmentType: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'], example: 'full-time' },
          experienceLevel:{ type: 'string', enum: ['junior', 'mid', 'senior'], example: 'mid' },
          budgetMin:      { type: 'number', example: 1500 },
          budgetMax:      { type: 'number', example: 3000 },
          skills:         { type: 'array', items: { type: 'string' }, example: ['React', 'TypeScript'] },
        },
      },
      // ── Candidate profile ─────────────────────────────────────────────────
      CandidateProfile: {
        type: 'object',
        properties: {
          userId:           { type: 'integer' },
          headline:         { type: 'string', example: 'Full-Stack Developer · 4 yrs' },
          bio:              { type: 'string' },
          location:         { type: 'string', example: 'Prishtinë, Kosovo' },
          phone:            { type: 'string' },
          freelanceActive:  { type: 'boolean' },
          yearsExperience:  { type: 'integer' },
          willingToRelocate:{ type: 'boolean' },
          linkedinUrl:      { type: 'string' },
          githubUrl:        { type: 'string' },
          cvPath:           { type: 'string' },
          skills:           { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, level: { type: 'string' } } } },
          experiences:      { type: 'array', items: { type: 'object' } },
          educations:       { type: 'array', items: { type: 'object' } },
        },
      },
      // ── Application ───────────────────────────────────────────────────────
      ApplicationBody: {
        type: 'object',
        required: ['jobId'],
        properties: {
          jobId:            { type: 'integer', example: 42 },
          coverLetter:      { type: 'string' },
          expectedSalary:   { type: 'number', example: 2000 },
          availableFrom:    { type: 'string', format: 'date', example: '2025-09-01' },
          phone:            { type: 'string', example: '+383 44 123 456' },
          willingToRelocate:{ type: 'boolean', example: true },
          yearsExperience:  { type: 'integer', example: 3 },
        },
      },
      // ── Pipeline ──────────────────────────────────────────────────────────
      PipelineStageBody: {
        type: 'object',
        required: ['name'],
        properties: {
          name:        { type: 'string', example: 'Technical Interview' },
          hasCalendar: { type: 'boolean', example: true },
        },
      },
      // ── Bid ───────────────────────────────────────────────────────────────
      BidBody: {
        type: 'object',
        required: ['proposedRate', 'coverNote'],
        properties: {
          proposedRate: { type: 'number', example: 45 },
          currency:     { type: 'string', example: 'USD' },
          coverNote:    { type: 'string', example: 'I have 5 years of experience in this domain.' },
          estimatedDays:{ type: 'integer', example: 30 },
        },
      },
      // ── Notification ──────────────────────────────────────────────────────
      Notification: {
        type: 'object',
        properties: {
          id:        { type: 'integer' },
          type:      { type: 'string', example: 'pipeline_stage_change' },
          message:   { type: 'string' },
          link:      { type: 'string', nullable: true },
          isRead:    { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // ── Contract ──────────────────────────────────────────────────────────
      ContractBody: {
        type: 'object',
        required: ['title', 'rate'],
        properties: {
          title:       { type: 'string', example: 'Frontend Development Contract' },
          description: { type: 'string' },
          rate:        { type: 'number', example: 2500 },
          currency:    { type: 'string', example: 'EUR' },
          startDate:   { type: 'string', format: 'date', example: '2025-08-01' },
          endDate:     { type: 'string', format: 'date', example: '2025-11-01' },
        },
      },
      // ── Category ──────────────────────────────────────────────────────────
      Category: {
        type: 'object',
        properties: {
          id:   { type: 'integer' },
          name: { type: 'string', example: 'Engineering' },
          slug: { type: 'string', example: 'engineering' },
        },
      },
      // ── Plan ──────────────────────────────────────────────────────────────
      Plan: {
        type: 'object',
        properties: {
          id:       { type: 'integer' },
          name:     { type: 'string', example: 'Pro' },
          price:    { type: 'number', example: 29.99 },
          currency: { type: 'string', example: 'USD' },
          interval: { type: 'string', enum: ['month', 'year'] },
          features: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid access token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Insufficient role permissions',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      BadRequest: {
        description: 'Validation error or bad input',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },

  // ── TAG DEFINITIONS ──────────────────────────────────────────────────────────
  tags: [
    { name: 'Auth',          description: 'Registration, login, token refresh, logout' },
    { name: 'Jobs',          description: 'Public job board and recruiter job management' },
    { name: 'Candidate',     description: 'Candidate profile, applications, skills, CV, saved jobs' },
    { name: 'Recruiter',     description: 'Recruiter profile, applicant review, team management' },
    { name: 'Pipeline',      description: 'Kanban hiring pipeline — create stages, move candidates' },
    { name: 'Bids',          description: 'Freelance bidding — Mode A (candidate bids on job)' },
    { name: 'Invitations',   description: 'Freelance invitations — Mode B (recruiter invites candidate)' },
    { name: 'Contracts',     description: 'Employment / freelance contracts' },
    { name: 'Conversations', description: 'Messaging — conversations and messages' },
    { name: 'Notifications', description: 'In-app notifications with real-time Socket.IO delivery' },
    { name: 'Plans',         description: 'Subscription plans' },
    { name: 'Subscriptions', description: 'Stripe-based plan subscriptions and webhooks' },
    { name: 'Categories',    description: 'Job categories' },
    { name: 'Exports',       description: 'Data export (CSV / Excel / JSON)' },
    { name: 'Admin',         description: 'Admin-only: users, jobs, companies, audit logs, CMS' },
  ],

  // ── PATHS ────────────────────────────────────────────────────────────────────
  paths: {

    // ── Auth ─────────────────────────────────────────────────────────────────
    '/api/users/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } } },
        responses: {
          201: { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/api/users/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive access token',
        description: 'Sets an httpOnly `refreshToken` cookie and returns a short-lived JWT access token.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } } },
        responses: {
          200: { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/users/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token using httpOnly cookie',
        responses: {
          200: { description: 'New access token issued' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/users/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout — revoke refresh token',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Jobs ─────────────────────────────────────────────────────────────────
    '/api/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'Browse all open jobs (public)',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'closed', 'archived'], default: 'open' } },
          { name: 'workMode', in: 'query', schema: { type: 'string', enum: ['remote', 'onsite', 'hybrid'] } },
          { name: 'employmentType', in: 'query', schema: { type: 'string' } },
          { name: 'skill', in: 'query', schema: { type: 'string', description: 'Filter by skill name' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated job list',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/Pagination' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Jobs'],
        summary: 'Create a job listing (recruiter / admin)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JobBody' } } } },
        responses: {
          201: { description: 'Job created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/jobs/{id}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get a single job by ID (public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Job detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } } },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Jobs'],
        summary: 'Update a job (recruiter / admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JobBody' } } } },
        responses: {
          200: { description: 'Job updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Jobs'],
        summary: 'Delete a job (recruiter / admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Job deleted' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/jobs/{id}/status': {
      patch: {
        tags: ['Jobs'],
        summary: 'Update job status (recruiter / admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['open', 'closed', 'archived'] } } } } } },
        responses: { 200: { description: 'Status updated' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },

    // ── Candidate ─────────────────────────────────────────────────────────────
    '/api/candidate/profile': {
      get: {
        tags: ['Candidate'],
        summary: 'Get my candidate profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Candidate profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/CandidateProfile' } } } }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
      put: {
        tags: ['Candidate'],
        summary: 'Update my candidate profile',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CandidateProfile' } } } },
        responses: { 200: { description: 'Profile updated' }, 401: { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/api/candidate/freelance': {
      put: {
        tags: ['Candidate'],
        summary: 'Toggle freelance availability mode',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { active: { type: 'boolean' } }, required: ['active'] } } } },
        responses: { 200: { description: 'Freelance mode updated' } },
      },
    },
    '/api/candidate/cv': {
      post: {
        tags: ['Candidate'],
        summary: 'Upload CV (PDF or Word, max 5 MB)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { cv: { type: 'string', format: 'binary' } } } } } },
        responses: { 200: { description: 'CV uploaded, path returned' } },
      },
    },
    '/api/candidate/applications': {
      post: {
        tags: ['Candidate'],
        summary: 'Apply to a job',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApplicationBody' } } } },
        responses: { 201: { description: 'Application submitted' }, 409: { description: 'Already applied' } },
      },
      get: {
        tags: ['Candidate'],
        summary: 'List my applications',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Application list' } },
      },
    },
    '/api/candidate/applications/{applicationId}/notes': {
      get: {
        tags: ['Candidate'],
        summary: 'Get pipeline notes for an application',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'applicationId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Notes list' } },
      },
    },
    '/api/candidate/saved-jobs': {
      get: {
        tags: ['Candidate'],
        summary: 'List saved jobs',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Saved jobs' } },
      },
    },
    '/api/candidate/saved-job-ids': {
      get: {
        tags: ['Candidate'],
        summary: 'Get array of saved job IDs (for quick UI check)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Array of job IDs' } },
      },
    },
    '/api/candidate/saved-jobs/{jobId}': {
      post:   { tags: ['Candidate'], summary: 'Save a job', security: [{ bearerAuth: [] }], parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Job saved' } } },
      delete: { tags: ['Candidate'], summary: 'Unsave a job', security: [{ bearerAuth: [] }], parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Job unsaved' } } },
    },
    '/api/candidate/skills': {
      post: {
        tags: ['Candidate'],
        summary: 'Add a skill to profile',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'React' }, level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'], example: 'advanced' } } } } } },
        responses: { 201: { description: 'Skill added' } },
      },
    },
    '/api/candidate/skills/{id}': {
      delete: { tags: ['Candidate'], summary: 'Remove a skill', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Skill removed' } } },
    },
    '/api/candidate/experiences': {
      post: {
        tags: ['Candidate'],
        summary: 'Add a work experience entry',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'company'], properties: { title: { type: 'string' }, company: { type: 'string' }, startDate: { type: 'string', format: 'date' }, endDate: { type: 'string', format: 'date', nullable: true }, description: { type: 'string' } } } } } },
        responses: { 201: { description: 'Experience added' } },
      },
    },
    '/api/candidate/experiences/{id}': {
      put:    { tags: ['Candidate'], summary: 'Update experience', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Candidate'], summary: 'Delete experience', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/candidate/educations': {
      post: {
        tags: ['Candidate'],
        summary: 'Add an education entry',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['degree', 'institution'], properties: { degree: { type: 'string', example: 'BSc Computer Science' }, institution: { type: 'string', example: 'UBT' }, startYear: { type: 'integer', example: 2020 }, endYear: { type: 'integer', example: 2024, nullable: true } } } } } },
        responses: { 201: { description: 'Education added' } },
      },
    },
    '/api/candidate/educations/{id}': {
      put:    { tags: ['Candidate'], summary: 'Update education', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Candidate'], summary: 'Delete education', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },

    // ── Recruiter ─────────────────────────────────────────────────────────────
    '/api/recruiter/profile': {
      get: {
        tags: ['Recruiter'],
        summary: 'Get recruiter profile (includes company)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Recruiter profile with company details' } },
      },
    },
    '/api/recruiter/setup': {
      post: {
        tags: ['Recruiter'],
        summary: 'Set up / update recruiter company profile',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { companyName: { type: 'string' }, industry: { type: 'string' }, website: { type: 'string' }, description: { type: 'string' } } } } } },
        responses: { 200: { description: 'Profile updated' } },
      },
    },
    '/api/recruiter/logo': {
      post: {
        tags: ['Recruiter'],
        summary: 'Upload company logo (image, max 5 MB)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { logo: { type: 'string', format: 'binary' } } } } } },
        responses: { 200: { description: 'Logo uploaded' } },
      },
    },
    '/api/recruiter/jobs': {
      get: {
        tags: ['Recruiter'],
        summary: 'List all jobs owned by my company',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page',   in: 'query', schema: { type: 'integer' } },
          { name: 'limit',  in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Jobs list' } },
      },
    },
    '/api/recruiter/applicants': {
      get: {
        tags: ['Recruiter'],
        summary: 'List all applicants for my company\'s jobs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'jobId', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page',  in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Applicant list with candidate details' } },
      },
    },
    '/api/recruiter/applicants/{id}/interview': {
      post: {
        tags: ['Recruiter'],
        summary: 'Schedule an interview for an applicant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Application ID' }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { interviewAt: { type: 'string', format: 'date-time' } } } } } },
        responses: { 200: { description: 'Interview scheduled, candidate notified' } },
      },
    },
    '/api/recruiter/freelancers': {
      get: {
        tags: ['Recruiter'],
        summary: 'List bids received from freelancers',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Bid list' } },
      },
    },
    '/api/recruiter/candidates': {
      get: {
        tags: ['Recruiter'],
        summary: 'Browse all candidates (read from MongoDB projection)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q',               in: 'query', schema: { type: 'string' }, description: 'Search by name or headline' },
          { name: 'skills',          in: 'query', schema: { type: 'string' }, description: 'Comma-separated skill names' },
          { name: 'location',        in: 'query', schema: { type: 'string' } },
          { name: 'freelanceActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'page',            in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',           in: 'query', schema: { type: 'integer', default: 18 } },
        ],
        responses: { 200: { description: 'Candidate list with pagination' } },
      },
    },
    '/api/recruiter/team': {
      get: {
        tags: ['Recruiter'],
        summary: 'List all team members of my company',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Team member list' } },
      },
      post: {
        tags: ['Recruiter'],
        summary: 'Add an existing user to the company as a recruiter',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'jobTitle'], properties: { email: { type: 'string', format: 'email', example: 'colleague@company.com' }, jobTitle: { type: 'string', example: 'Technical Recruiter' } } } } } },
        responses: { 201: { description: 'Member added' }, 404: { description: 'User not found' }, 409: { description: 'Already member of a company' } },
      },
    },

    // ── Pipeline ──────────────────────────────────────────────────────────────
    '/api/pipeline': {
      post: {
        tags: ['Pipeline'],
        summary: 'Create the company hiring pipeline',
        description: 'Creates a pipeline with an automatic first "Application" stage plus the custom stages you provide.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { stages: { type: 'array', items: { $ref: '#/components/schemas/PipelineStageBody' } } } } } } },
        responses: { 201: { description: 'Pipeline created with stages' }, 409: { description: 'Pipeline already exists', content: { 'application/json': { schema: { type: 'object', properties: { code: { type: 'string', example: 'PIPELINE_EXISTS' } } } } } } },
      },
      put: {
        tags: ['Pipeline'],
        summary: 'Edit pipeline — destructive (resets all stage assignments)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { stages: { type: 'array', items: { $ref: '#/components/schemas/PipelineStageBody' } } } } } } },
        responses: { 200: { description: 'Pipeline updated, stage assignments cleared' } },
      },
    },
    '/api/pipeline/my': {
      get: {
        tags: ['Pipeline'],
        summary: 'Get the company\'s pipeline definition',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Pipeline with stages' }, 404: { description: 'No pipeline created yet' } },
      },
    },
    '/api/pipeline/board': {
      get: {
        tags: ['Pipeline'],
        summary: 'Get Kanban board data (stages + candidate cards)',
        description: 'Returns all pipeline stages with candidates placed in their current stage. Candidate cards include a `lastNotificationRead` flag — if `false`, the candidate must read the notification before the recruiter can move them.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'search', in: 'query', schema: { type: 'string' }, description: 'Filter candidates by name' }],
        responses: { 200: { description: 'Kanban board' }, 404: { description: 'No pipeline (code: NO_PIPELINE)' } },
      },
    },
    '/api/pipeline/move': {
      post: {
        tags: ['Pipeline'],
        summary: 'Move a candidate to a different pipeline stage',
        description: 'A transition note is mandatory. Blocked if the candidate has an unread pipeline notification.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['applicationId', 'toStageId', 'note'], properties: { applicationId: { type: 'integer' }, toStageId: { type: 'integer' }, note: { type: 'string', example: 'Strong technical test — moving to final round.' }, interviewDate: { type: 'string', format: 'date-time', nullable: true } } } } } },
        responses: { 200: { description: 'Candidate moved, notification sent' }, 400: { description: 'Note required (NOTE_REQUIRED)' }, 403: { description: 'Candidate has unread notification (NOTIFICATION_NOT_READ)' } },
      },
    },
    '/api/pipeline/note': {
      post: {
        tags: ['Pipeline'],
        summary: 'Add a note to an application without moving stages',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['applicationId', 'stageId', 'note'], properties: { applicationId: { type: 'integer' }, stageId: { type: 'integer' }, note: { type: 'string' } } } } } },
        responses: { 200: { description: 'Note saved' } },
      },
    },
    '/api/pipeline/reject': {
      post: {
        tags: ['Pipeline'],
        summary: 'Reject a candidate at the final stage',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['applicationId'], properties: { applicationId: { type: 'integer' } } } } } },
        responses: { 200: { description: 'Candidate rejected, application status updated' } },
      },
    },
    '/api/pipeline/notes': {
      get: {
        tags: ['Pipeline'],
        summary: 'Get all transition notes for the company',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Transition notes' } },
      },
    },

    // ── Bids ──────────────────────────────────────────────────────────────────
    '/api/jobs/{jobId}/bids': {
      post: {
        tags: ['Bids'],
        summary: 'Submit a bid on a freelance job (candidate)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BidBody' } } } },
        responses: { 201: { description: 'Bid submitted' }, 409: { description: 'Already bid on this job' } },
      },
      get: {
        tags: ['Bids'],
        summary: 'List bids for a job (recruiter / admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Bid list' } },
      },
    },
    '/api/me/bids': {
      get: {
        tags: ['Bids'],
        summary: 'List my submitted bids (candidate)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'My bids' } },
      },
    },
    '/api/bids/{bidId}/withdraw': {
      patch: {
        tags: ['Bids'],
        summary: 'Withdraw a bid (candidate)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bidId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Bid withdrawn' } },
      },
    },
    '/api/bids/{bidId}/accept': {
      post: {
        tags: ['Bids'],
        summary: 'Accept a bid (recruiter)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bidId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Bid accepted, contract created' } },
      },
    },
    '/api/bids/{bidId}/reject': {
      post: {
        tags: ['Bids'],
        summary: 'Reject a bid (recruiter)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bidId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Bid rejected' } },
      },
    },

    // ── Invitations ───────────────────────────────────────────────────────────
    '/api/freelancers/search': {
      get: {
        tags: ['Invitations'],
        summary: 'Search available freelancers (recruiter)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Freelancer list' } },
      },
    },
    '/api/invitations': {
      post: {
        tags: ['Invitations'],
        summary: 'Send an invitation to a freelancer for a job (recruiter)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['freelancerId', 'jobId'], properties: { freelancerId: { type: 'integer' }, jobId: { type: 'integer' }, note: { type: 'string' } } } } } },
        responses: { 201: { description: 'Invitation sent' } },
      },
    },
    '/api/jobs/{jobId}/invitations': {
      get: {
        tags: ['Invitations'],
        summary: 'List invitations sent for a job (recruiter)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Invitation list' } },
      },
    },
    '/api/invitations/{id}/revoke': {
      patch: {
        tags: ['Invitations'],
        summary: 'Revoke a sent invitation (recruiter)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Invitation revoked' } },
      },
    },
    '/api/me/invitations': {
      get: {
        tags: ['Invitations'],
        summary: 'List my received invitations (candidate / freelancer)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Invitation list' } },
      },
    },
    '/api/invitations/{id}/accept': {
      post: {
        tags: ['Invitations'],
        summary: 'Accept an invitation (candidate)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Accepted' } },
      },
    },
    '/api/invitations/{id}/reject': {
      post: {
        tags: ['Invitations'],
        summary: 'Reject an invitation (candidate)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Rejected' } },
      },
    },

    // ── Contracts ─────────────────────────────────────────────────────────────
    '/api/contracts': {
      post: {
        tags: ['Contracts'],
        summary: 'Create a contract draft (recruiter)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContractBody' } } } },
        responses: { 201: { description: 'Contract draft created, awaiting candidate approval' } },
      },
      get: {
        tags: ['Contracts'],
        summary: 'List my contracts (both sides)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Contract list' } },
      },
    },
    '/api/contracts/{id}': {
      get: {
        tags: ['Contracts'],
        summary: 'Get a single contract',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Contract detail' }, 404: { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/api/contracts/{id}/approve': {
      post: {
        tags: ['Contracts'],
        summary: 'Approve a contract (candidate or recruiter)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Contract approved / activated' } },
      },
    },

    // ── Conversations ─────────────────────────────────────────────────────────
    '/api/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'List all conversations for the current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Conversation list with last message preview' } },
      },
      post: {
        tags: ['Conversations'],
        summary: 'Start or retrieve a conversation with another user',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['recipientId'], properties: { recipientId: { type: 'integer', example: 7 } } } } } },
        responses: { 200: { description: 'Conversation returned (existing or new)' } },
      },
    },
    '/api/conversations/{id}/messages': {
      get: {
        tags: ['Conversations'],
        summary: 'Get all messages in a conversation',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Conversation ID' }],
        responses: { 200: { description: 'Message list' } },
      },
    },

    // ── Notifications ─────────────────────────────────────────────────────────
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get my notifications',
        description: 'New notifications are also pushed in real-time via Socket.IO on the `notification:new` event.',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Notification list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } },
      },
    },
    '/api/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Marked as read' } },
      },
    },
    '/api/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'All notifications marked as read' } },
      },
    },

    // ── Plans ─────────────────────────────────────────────────────────────────
    '/api/plans': {
      get: {
        tags: ['Plans'],
        summary: 'List all available subscription plans',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Plan list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Plan' } } } } } },
      },
      post: {
        tags: ['Plans'],
        summary: 'Create a plan (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Plan' } } } },
        responses: { 201: { description: 'Plan created' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/api/plans/{id}': {
      put:    { tags: ['Plans'], summary: 'Update a plan (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Plans'], summary: 'Delete a plan (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },

    // ── Subscriptions ─────────────────────────────────────────────────────────
    '/api/subscriptions/checkout': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Create a Stripe Checkout session for a plan',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['planId'], properties: { planId: { type: 'integer', example: 2 } } } } } },
        responses: { 200: { description: 'Stripe Checkout URL', content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', example: 'https://checkout.stripe.com/...' } } } } } } },
      },
    },
    '/api/subscriptions/webhook': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Stripe webhook receiver (internal)',
        description: 'Handles `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` events from Stripe.',
        responses: { 200: { description: 'Event acknowledged' } },
      },
    },

    // ── Categories ────────────────────────────────────────────────────────────
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List all job categories',
        responses: { 200: { description: 'Category list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } },
      },
    },

    // ── Exports ───────────────────────────────────────────────────────────────
    '/api/exports/{entity}/{format}': {
      post: {
        tags: ['Exports'],
        summary: 'Trigger a data export (admin only)',
        description: 'Generates a file and stores it. Supported entities: `users`, `jobs`, `applications`, `companies`, `payments`. Supported formats: `csv`, `excel`, `json`.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'entity', in: 'path', required: true, schema: { type: 'string', enum: ['users', 'jobs', 'applications', 'companies', 'payments'] } },
          { name: 'format', in: 'path', required: true, schema: { type: 'string', enum: ['csv', 'excel', 'json'] } },
        ],
        responses: { 200: { description: 'Export file URL returned' }, 403: { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/api/exports/my': {
      get: {
        tags: ['Exports'],
        summary: 'List my export history (admin only)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Export history' } },
      },
    },

    // ── Admin ─────────────────────────────────────────────────────────────────
    '/api/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Platform dashboard statistics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Aggregate stats (users, jobs, applications, revenue)' } },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q',     in: 'query', schema: { type: 'string' } },
          { name: 'role',  in: 'query', schema: { type: 'string' } },
          { name: 'page',  in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated user list' } },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create a user manually',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } } },
        responses: { 201: { description: 'User created' } },
      },
    },
    '/api/admin/users/{id}': {
      get:    { tags: ['Admin'], summary: 'Get user by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'User detail' } } },
      put:    { tags: ['Admin'], summary: 'Update user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin'], summary: 'Delete user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/admin/jobs': {
      get: {
        tags: ['Admin'],
        summary: 'List all jobs platform-wide',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }, { name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Job list' } },
      },
    },
    '/api/admin/jobs/{id}': {
      get:    { tags: ['Admin'], summary: 'Get job by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Job detail' } } },
      put:    { tags: ['Admin'], summary: 'Update job', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin'], summary: 'Delete job', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/admin/companies': {
      get: {
        tags: ['Admin'],
        summary: 'List all companies',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Company list' } },
      },
    },
    '/api/admin/companies/{id}': {
      get:    { tags: ['Admin'], summary: 'Get company by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Company detail' } } },
      put:    { tags: ['Admin'], summary: 'Update company', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin'], summary: 'Delete company', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/admin/applications': {
      get: {
        tags: ['Admin'],
        summary: 'List all applications platform-wide',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Application list' } },
      },
    },
    '/api/admin/candidates': {
      get: {
        tags: ['Admin'],
        summary: 'Browse all candidates (admin view)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q',               in: 'query', schema: { type: 'string' } },
          { name: 'skills',          in: 'query', schema: { type: 'string' } },
          { name: 'location',        in: 'query', schema: { type: 'string' } },
          { name: 'freelanceActive', in: 'query', schema: { type: 'string' } },
          { name: 'page',            in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Candidate list' } },
      },
    },
    '/api/admin/categories': {
      get:  { tags: ['Admin'], summary: 'List categories', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Category list' } } },
      post: { tags: ['Admin'], summary: 'Create category', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/api/admin/categories/{id}': {
      put:    { tags: ['Admin'], summary: 'Update category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin'], summary: 'Delete category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'View audit log trail',
        description: 'Every critical write action is recorded with user, action, entity, old value, new value, and IP address.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'action',   in: 'query', schema: { type: 'string' } },
          { name: 'userId',   in: 'query', schema: { type: 'integer' } },
          { name: 'page',     in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Audit log entries' } },
      },
    },
    '/api/admin/payment-logs': {
      get: {
        tags: ['Admin'],
        summary: 'View all payment transactions',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Payment log' } },
      },
    },
    '/api/admin/roles': {
      get: {
        tags: ['Admin'],
        summary: 'List all roles',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Role list' } },
      },
    },
  },
};

module.exports = spec;
