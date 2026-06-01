/**
 * jobModePolicy — the single source of truth for what a job permits.
 *
 * Modes A/B/C are encoded as data, not branches:
 *   job_mode = 'public' (A) | 'invite' (B) | 'both' (C)
 *
 * Bid and Invitation handlers consult these predicates instead of knowing
 * about each other, so Mode C is simply the union with zero duplicated logic.
 */

/** Bids are accepted on freelance jobs whose mode exposes a public board (A or C). */
function bidsAllowed(job) {
  return job?.employmentType === 'freelance'
      && ['public', 'both'].includes(job.jobMode);
}

/** Direct invitations are allowed on freelance jobs in invite or both mode (B or C). */
function invitesAllowed(job) {
  return job?.employmentType === 'freelance'
      && ['invite', 'both'].includes(job.jobMode);
}

/** A job is on the public board only when open AND its mode exposes bids. */
function isPubliclyVisible(job) {
  return job?.status === 'open' && bidsAllowed(job);
}

module.exports = { bidsAllowed, invitesAllowed, isPubliclyVisible };
