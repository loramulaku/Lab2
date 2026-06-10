/**
 * contractSync — CQRS read-side projection for Contracts.
 * Called after a Contract is created or its status changes.
 */
const Contract   = require('../models/sql/Contract');
const Job        = require('../models/sql/Job');
const Company    = require('../models/sql/Company');
const User       = require('../models/sql/User');
const FailedSync = require('../models/sql/FailedSync');
const contractViewRepo = require('../repositories/mongodb/contract.repo');

async function syncContract(contractId) {
  const c = await Contract.findByPk(contractId);
  if (!c) {
    await contractViewRepo.delete(contractId);
    return;
  }

  const job        = c.jobId       ? await Job.findByPk(c.jobId)       : null;
  const company    = c.companyId   ? await Company.findByPk(c.companyId) : null;
  const freelancer = c.freelancerId ? await User.findByPk(c.freelancerId) : null;

  await contractViewRepo.upsert({
    id:                  c.id,
    jobId:               c.jobId,
    freelancerId:        c.freelancerId,
    companyId:           c.companyId,
    bidId:               c.bidId        ?? null,
    invitationId:        c.invitationId  ?? null,
    applicationId:       c.applicationId ?? null,
    source:              c.source        ?? null,
    agreedPrice:         c.agreedPrice ? Number(c.agreedPrice) : null,
    startDate:           c.startDate,
    endDate:             c.endDate,
    status:              c.status,
    approvedAt:          c.approvedAt    ?? null,
    price:               c.price ? Number(c.price) : null,
    jobTitle:            job?.title       ?? null,
    companyName:         company?.name    ?? null,
    freelancerFirstName: freelancer?.firstName ?? null,
    freelancerLastName:  freelancer?.lastName  ?? null,
    createdAt:           c.createdAt           ?? null,
  });

  await FailedSync.destroy({ where: { entityType: 'contract', entityId: contractId } });
}

function syncContractSafe(contractId) {
  syncContract(contractId).catch(async (err) => {
    console.error(`[contractSync] Failed to sync contractId=${contractId}:`, err.message);
    await recordFailure('contract', contractId, err).catch(() => {});
  });
}

async function recordFailure(entityType, entityId, err) {
  const [record, created] = await FailedSync.findOrCreate({
    where: { entityType, entityId },
    defaults: {
      entityType, entityId,
      errorMessage: err.message, attempts: 1,
      lastAttemptedAt: new Date(), createdAt: new Date(),
    },
  });
  if (!created) {
    await record.update({
      errorMessage: err.message, attempts: record.attempts + 1,
      lastAttemptedAt: new Date(), resolvedAt: null,
    });
  }
}

module.exports = { syncContract, syncContractSafe };
