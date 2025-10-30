// src/components/Common/Notification.jsx
import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Notification = ({ notification }) => {
  const { removeNotification } = useNotification();

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = icons[notification.type] || Info;

  return (
    <div
      className={`
        relative flex items-start p-4 mb-2 border rounded-lg shadow-sm
        ${styles[notification.type]}
        animate-slide-up
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
        notification.type === 'success' ? 'text-green-500' :
        notification.type === 'error' ? 'text-red-500' :
        notification.type === 'warning' ? 'text-yellow-500' :
        'text-blue-500'
      }`} />
      
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className="text-sm font-medium mb-1">{notification.title}</p>
        )}
        <p className="text-sm">{notification.message}</p>
        
        {notification.action && (
          <div className="mt-2">
            <button
              onClick={notification.action.onClick}
              className="text-sm font-medium underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => removeNotification(notification.id)}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Notifications Container
export const NotificationsContainer = () => {
  const { notifications } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-full">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};

export default Notification;