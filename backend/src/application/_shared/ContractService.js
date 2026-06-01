const { Op } = require('sequelize');
const { sequelize } = require('../../config/mysql');
const Job        = require('../../models/sql/Job');
const Bid        = require('../../models/sql/Bid');
const Invitation = require('../../models/sql/Invitation');
const Contract   = require('../../models/sql/Contract');

/**
 * ContractService — the ONLY place a Contract is created.
 *
 * Both accept paths (recruiter accepts a bid, freelancer accepts an invite)
 * converge here. This is what keeps Mode A and Mode B decoupled but
 * consistent: neither slice imports the other; both build a "winning offer"
 * and hand it to createFromOffer().
 *
 * Atomicity / the accept race (edge case #5) is guaranteed by two layers:
 *   1. SELECT ... FOR UPDATE on the Job row serialises concurrent accepts.
 *   2. The uq_one_active_contract_per_job unique index is the final invariant
 *      if locking is ever bypassed — a second INSERT throws, mapped to 409.
 *
 * On success it closes the job and mass-rejects every other pending offer,
 * then returns the ids the caller must re-project to the read side.
 */
const ContractService = {
  /**
   * @param {object}  offer
   * @param {'bid'|'invite'} offer.source
   * @param {number}  offer.jobId
   * @param {number}  offer.freelancerId
   * @param {number}  offer.companyId
   * @param {number}  offer.agreedPrice
   * @param {number} [offer.deliveryTimeDays]
   * @param {number} [offer.bidId]
   * @param {number} [offer.invitationId]
   * @returns {Promise<{ contract: object, rejectedBidIds: number[], rejectedInvitationIds: number[] }>}
   */
  async createFromOffer(offer) {
    const {
      source, jobId, freelancerId, companyId,
      agreedPrice, deliveryTimeDays, bidId = null, invitationId = null,
    } = offer;

    return sequelize.transaction(async (t) => {
      // 1. Lock the job row — serialises competing accepts.
      const job = await Job.findByPk(jobId, { lock: t.LOCK.UPDATE, transaction: t });
      if (!job) {
        throw httpError(404, 'Job not found', 'JOB_NOT_FOUND');
      }
      if (['closed', 'archived'].includes(job.status)) {
        throw httpError(409, 'Job is no longer open for hiring', 'JOB_NOT_OPEN');
      }

      // 2. Create the contract — guarded by uq_one_active_contract_per_job.
      let contract;
      try {
        const today = new Date().toISOString().slice(0, 10);
        contract = await Contract.create({
          jobId,
          freelancerId,
          companyId,
          bidId,
          invitationId,
          source,
          agreedPrice,
          price: agreedPrice,
          startDate: today,
          status: 'active',
          activeKey: `job:${jobId}`,   // occupies the one-active-contract slot
        }, { transaction: t });
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          throw httpError(409, 'This job already has an active contract', 'ALREADY_HIRED');
        }
        throw err;
      }

      // 3. Mark the winning offer accepted.
      if (source === 'bid' && bidId) {
        await Bid.update(
          { status: 'accepted', updatedAt: new Date() },
          { where: { id: bidId }, transaction: t },
        );
      }
      if (source === 'invite' && invitationId) {
        await Invitation.update(
          { status: 'accepted', activeKey: null, respondedAt: new Date(), updatedAt: new Date() },
          { where: { id: invitationId }, transaction: t },
        );
      }

      // 4. Close the job.
      await job.update({ status: 'closed', closedAt: new Date() }, { transaction: t });

      // 5. Mass-reject every other pending offer on this job.
      const rejectedBids = await Bid.findAll({
        where: { jobId, status: 'pending', id: { [Op.ne]: bidId ?? 0 } },
        attributes: ['id'], transaction: t,
      });
      const rejectedInvites = await Invitation.findAll({
        where: { jobId, status: 'pending', id: { [Op.ne]: invitationId ?? 0 } },
        attributes: ['id'], transaction: t,
      });
      await Bid.update(
        { status: 'rejected', updatedAt: new Date() },
        { where: { jobId, status: 'pending', id: { [Op.ne]: bidId ?? 0 } }, transaction: t },
      );
      await Invitation.update(
        { status: 'rejected', activeKey: null, respondedAt: new Date(), updatedAt: new Date() },
        { where: { jobId, status: 'pending', id: { [Op.ne]: invitationId ?? 0 } }, transaction: t },
      );

      return {
        contract,
        rejectedBidIds:        rejectedBids.map(b => b.id),
        rejectedInvitationIds: rejectedInvites.map(i => i.id),
      };
    });
  },
};

function httpError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

module.exports = ContractService;
module.exports.httpError = httpError;
