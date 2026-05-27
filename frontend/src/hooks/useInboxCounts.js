import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import messageService from '../services/messageService';

export default function useInboxCounts() {
  const { token } = useAuth();
  const [counts, setCounts] = useState({ notifications: 0, messages: 0 });

  useEffect(() => {
    if (!token) {
      setCounts({ notifications: 0, messages: 0 });
      return;
    }

    let cancelled = false;

    const load = async () => {
      const [notifications, messages] = await Promise.all([
        notificationService.getUnreadCount(),
        messageService.getUnreadCount(),
      ]);
      if (!cancelled) {
        setCounts({ notifications, messages });
      }
    };

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  return counts;
}
