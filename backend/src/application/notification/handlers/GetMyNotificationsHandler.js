const NotificationView = require('../../../models/nosql/NotificationView');

class GetMyNotificationsHandler {
  async handle(query) {
    const filter = { userId: query.userId };
    if (query.onlyUnread) filter.isRead = false;

    const docs = await NotificationView
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .lean();

    return docs.map(d => ({
      id:        d._id,
      userId:    d.userId,
      type:      d.type,
      title:     d.title ?? null,
      message:   d.message,
      link:      d.link ?? null,
      isRead:    d.isRead,
      createdAt: d.createdAt,
    }));
  }
}

module.exports = new GetMyNotificationsHandler();
