import { useEffect } from 'react';
import useStore from '../../store/useStore';

export default function ToastContainer() {
  const notifications = useStore((s) => s.notifications);
  const removeNotification = useStore((s) => s.removeNotification);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((n) =>
      setTimeout(() => removeNotification(n.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  return (
    <div className="toast-container">
      {notifications.slice(0, 5).map((n) => (
        <div key={n.id} className={`toast ${n.type || 'info'}`}>
          <div>
            <div className="toast-title">{n.title}</div>
            <div className="toast-msg">{n.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
