import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Get page title based on current path
  const getPageTitle = () => {
    switch (true) {
      case pathname === '/':
        return 'Dashboard';
      case pathname.startsWith('/employees'):
        if (pathname.includes('/add')) return 'Add Employee';
        if (pathname.includes('/edit')) return 'Edit Employee';
        return 'Employees';
      case pathname.startsWith('/salaries'):
        if (pathname.includes('/add')) return 'Add Salary';
        if (pathname.includes('/edit')) return 'Edit Salary';
        return 'Salaries';
      case pathname === '/reports':
        return 'Reports';
      default:
        return 'Employee Management System';
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
        
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-700">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
