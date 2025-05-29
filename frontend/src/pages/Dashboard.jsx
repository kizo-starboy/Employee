import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    currentMonthPayments: 0,
    currentMonthTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Employee Payroll Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <div className="h-8 w-8 flex items-center justify-center font-bold">E</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <div className="h-8 w-8 flex items-center justify-center font-bold">D</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDepartments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <div className="h-8 w-8 flex items-center justify-center font-bold">P</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.currentMonthPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <div className="h-8 w-8 flex items-center justify-center font-bold">₣</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Payroll</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('en-RW', {
                  style: 'currency',
                  currency: 'RWF',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(parseFloat(stats.currentMonthTotal || 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/employees/add"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Add Employee
            </Link>

            <Link
              to="/departments/add"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Add Department
            </Link>

            <Link
              to="/salaries/add"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Process Payment
            </Link>

            <Link
              to="/reports"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
