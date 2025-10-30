cat > src/pages/Dashboard/Dashboard.jsx << 'EOF'
import React from 'react'
import { useAuth } from '../../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mb-6">
            You are logged in as a <span className="font-semibold capitalize">{user?.role}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Quick Actions</h3>
              <ul className="space-y-2 text-red-700">
                <li>• Update your profile</li>
                <li>• Find blood requests</li>
                <li>• View your donations</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Statistics</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Donations made: 0</li>
                <li>• Requests fulfilled: 0</li>
                <li>• Lives saved: 0</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Recent Activity</h3>
              <p className="text-green-700">No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
EOF