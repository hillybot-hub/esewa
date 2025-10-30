// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Map, 
  Droplet, 
  Users, 
  Settings, 
  BarChart3,
  Bell,
  FileText,
  Heart
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const donorMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Find Requests', href: '/map', icon: Map },
    { name: 'My Donations', href: '/donations', icon: Droplet },
    { name: 'Medical Records', href: '/medical-records', icon: FileText },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  const hospitalMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Blood Map', href: '/map', icon: Map },
    { name: 'Blood Requests', href: '/requests', icon: Droplet },
    { name: 'Inventory', href: '/inventory', icon: BarChart3 },
    { name: 'Medical Records', href: '/medical-records', icon: FileText },
    { name: 'Donors', href: '/donors', icon: Users },
  ];

  const receiverMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Find Blood', href: '/map', icon: Map },
    { name: 'My Requests', href: '/requests', icon: Droplet },
    { name: 'Hospitals', href: '/hospitals', icon: Users },
  ];

  const adminMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'System Logs', href: '/admin/logs', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  let menuItems = [];
  switch (user?.role) {
    case 'donor':
      menuItems = donorMenu;
      break;
    case 'hospital':
      menuItems = hospitalMenu;
      break;
    case 'receiver':
      menuItems = receiverMenu;
      break;
    case 'admin':
      menuItems = adminMenu;
      break;
    default:
      menuItems = [];
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blood-red mr-2" />
              <span className="text-xl font-bold">BloodDonation</span>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blood-red rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-blood-red text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>BloodDonation v1.0</p>
              <p>Making a difference together</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;