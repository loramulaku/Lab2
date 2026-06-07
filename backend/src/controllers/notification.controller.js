const GetMyNotificationsQuery         = require('../application/notification/queries/GetMyNotifications.query');
const MarkNotificationReadCommand     = require('../application/notification/commands/MarkNotificationRead.command');
const MarkAllNotificationsReadCommand = require('../application/notification/commands/MarkAllNotificationsRead.command');

const getMyNotificationsHandler       = require('../application/notification/handlers/GetMyNotificationsHandler');
const markNotificationReadHandler     = require('../application/notification/handlers/MarkNotificationReadHandler');
const markAllNotificationsReadHandler = require('../application/notification/handlers/MarkAllNotificationsReadHandler');

const getNotifications = async (req, res, next) => {
  try {
    const data = await getMyNotificationsHandler.handle(
      new GetMyNotificationsQuery({ userId: req.user.id, limit: 30 })
    );
    res.json(data);
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    await markNotificationReadHandler.handle(
      new MarkNotificationReadCommand({ notificationId: Number(req.params.id), userId: req.user.id })
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await markAllNotificationsReadHandler.handle(
      new MarkAllNotificationsReadCommand({ userId: req.user.id })
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
