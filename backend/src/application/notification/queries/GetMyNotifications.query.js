class GetMyNotificationsQuery {
  constructor({ userId, limit = 30, onlyUnread = false }) {
    this.userId     = userId;
    this.limit      = limit;
    this.onlyUnread = onlyUnread;
  }
}

module.exports = GetMyNotificationsQuery;
