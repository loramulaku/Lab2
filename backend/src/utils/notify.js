const Notification = require('../models/sql/Notification');

/**
 * Persists a notification to MySQL and pushes it in real-time to the user's
 * personal socket room. Errors are swallowed so callers never crash.
 *
 * io is resolved lazily (require inside the function) to avoid a circular-
 * dependency issue: app.js loads routes → handlers → this file at startup,
 * before module.exports = { io } has been assigned. By call time app.js is
 * fully initialised so the lazy require returns the real Server instance.
 */
async function notify({ userId, type, message }) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
      createdAt: new Date(),
    });

    const { io } = require('../../app');
    io?.to(`user:${userId}`).emit('new:notification', notification.toJSON());
  } catch {
    // never crash the caller
  }
}

module.exports = { notify };
