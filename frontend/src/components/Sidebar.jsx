import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-black text-white w-64 flex flex-col h-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold">EMS</h1>
        <p className="text-gray-400 text-sm">Employee Management System</p>
      </div>

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Departments
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Employees
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/salaries"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Salaries
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              Reports
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md w-full transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
