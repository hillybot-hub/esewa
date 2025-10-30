// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Map, Droplet, Users, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Requests', href: '/requests', icon: Droplet },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'Admin', href: '/admin', icon: Settings });
  }

  if (user?.role === 'hospital' || user?.role === 'donor') {
    navigation.push({ name: 'Medical Records', href: '/medical-records', icon: Users });
  }

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Droplet className="h-8 w-8" />
              <span className="font-bold text-xl">BloodConnect</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'bg-red-700 text-white'
                        : 'text-red-100 hover:bg-red-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user?.name} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-1 bg-red-700 hover:bg-red-800 px-3 py-2 rounded-md text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}