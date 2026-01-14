import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Booths</h3>
          <p className="text-3xl font-bold text-primary-600">50</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-green-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Quiz Attempts</h3>
          <p className="text-3xl font-bold text-purple-600">567</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Feedback</h3>
          <p className="text-3xl font-bold text-orange-600">89</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
