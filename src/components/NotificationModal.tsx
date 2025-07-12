import React, { useState, useEffect } from 'react';
import { NotificationService, Notification } from '../services/notificationService';
import Button from './Button';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await NotificationService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Obavijesti</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Učitavanje obavijesti...</p>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-600">Nema novih obavijesti</p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className={`font-medium ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Označi kao pročitano
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.some(n => !n.isRead) && (
          <div className="p-4 border-t border-gray-200">
            <Button
              text="Označi sve kao pročitano"
              onClick={handleMarkAllAsRead}
              variant="secondary"
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationModal;