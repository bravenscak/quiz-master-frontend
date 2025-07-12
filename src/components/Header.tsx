import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  SubscriptionService,
  Subscription,
} from "../services/subscriptionService";
import Button from "./Button";
import NotificationModal from "./NotificationModal";
import {
  NotificationService,
  Notification,
} from "../services/notificationService";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setNotificationsLoading(true);
    try {
      const notifs = await NotificationService.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error("Greška pri učitavanju notifikacija:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <header className="bg-quiz-primary text-white px-8 py-4 shadow-md flex justify-between items-center">
      <Link
        to="/"
        className="text-white no-underline hover:opacity-80 transition-opacity duration-200"
      >
        <h1 className="m-0 text-2xl font-bold">Quiz Master</h1>
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="relative">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="text-white hover:opacity-80 transition-opacity relative"
              >
                🔔
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity duration-200 bg-transparent border-none cursor-pointer"
              >
                <span className="font-bold">
                  {user?.username}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
                    <p className="font-semibold text-gray-800">
                      {user?.username}
                    </p>
                    <p className="text-xs">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                    onClick={() => setShowDropdown(false)}
                  >
                    📝 Moj profil
                  </Link>

                  {user?.roleName === "ORGANIZER" && (
                    <Link
                      to={"/organizer/" + user.id}  
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                      onClick={() =>
                        setShowDropdown(false)
                      }
                    >
                      🎯 Moji kvizovi
                    </Link>
                  )}

                  <div className="border-t border-gray-200 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 bg-transparent border-none cursor-pointer"
                    >
                      🚪 Odjavi se
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Button
            text="Prijava"
            onClick={handleLoginClick}
            variant="white"
          />
        )}
      </div>
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
          fetchNotifications();
        }}
      />
    </header>
  );
}

export default Header;
