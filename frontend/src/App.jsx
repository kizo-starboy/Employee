import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';

// Department pages
import DepartmentList from './pages/Departments/List';
import AddDepartment from './pages/Departments/Add';
import EditDepartment from './pages/Departments/Edit';

// Employee pages
import EmployeeList from './pages/Employees/List';
import AddEmployee from './pages/Employees/Add';
import EditEmployee from './pages/Employees/Edit';

// Salary pages
import SalaryList from './pages/Salaries/List';
import AddSalary from './pages/Salaries/Add';
import EditSalary from './pages/Salaries/Edit';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Public route component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route
              path="login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees/add"
              element={
                <ProtectedRoute>
                  <AddEmployee />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees/edit/:number"
              element={
                <ProtectedRoute>
                  <EditEmployee />
                </ProtectedRoute>
              }
            />

            <Route
              path="/salaries"
              element={
                <ProtectedRoute>
                  <SalaryList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/salaries/add"
              element={
                <ProtectedRoute>
                  <AddSalary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/salaries/edit/:id"
              element={
                <ProtectedRoute>
                  <EditSalary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/departments"
              element={
                <ProtectedRoute>
                  <DepartmentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/departments/add"
              element={
                <ProtectedRoute>
                  <AddDepartment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/departments/edit/:code"
              element={
                <ProtectedRoute>
                  <EditDepartment />
                </ProtectedRoute>
              }
            />

            {/* Redirect to dashboard if no route matches */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
