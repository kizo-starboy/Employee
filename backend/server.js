const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'employee-management-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database connection
const createDatabaseAndTables = async () => {
  try {
    // First create a connection without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS employee_management');

    // Close the initial connection
    await connection.end();

    // Now create the pool with the database specified
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'employee_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Drop tables if they exist to ensure a clean state
    // We need to drop them in the correct order due to foreign key constraints
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('DROP TABLE IF EXISTS salaries');
    await pool.query('DROP TABLE IF EXISTS employees');
    await pool.query('DROP TABLE IF EXISTS departments');
    await pool.query('DROP TABLE IF EXISTS users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create tables manually in the correct order to ensure dependencies are met
    try {
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create departments table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS departments (
          department_code VARCHAR(10) PRIMARY KEY,
          department_name VARCHAR(100) NOT NULL,
          gross_salary DECIMAL(10, 2) NOT NULL,
          total_deduction DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          net_salary DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create employees table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
          employee_number VARCHAR(20) PRIMARY KEY,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          position VARCHAR(100) NOT NULL,
          address TEXT,
          telephone VARCHAR(20),
          gender ENUM('Male', 'Female', 'Other'),
          hired_date DATE NOT NULL,
          department_code VARCHAR(10) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (department_code) REFERENCES departments(department_code)
        )
      `);

      // Create salaries table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS salaries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_number VARCHAR(20) NOT NULL,
          gross_salary DECIMAL(10, 2) NOT NULL,
          total_deduction DECIMAL(10, 2) NOT NULL,
          net_salary DECIMAL(10, 2) NOT NULL,
          month DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_number) REFERENCES employees(employee_number) ON DELETE CASCADE,
          UNIQUE KEY unique_employee_month (employee_number, month)
        )
      `);

      // Check if we need to insert sample data
      try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        if (userCount[0].count === 0) {
        try {
          // Insert default admin user
          await pool.query(`
            INSERT INTO users (username, password, first_name, last_name, email)
            VALUES ('admin', '$2b$10$mLEI4smzk0YQPfNx7KA5UOlHu.77V0VG/W9RqQmPBJA0KQNu4W5Hy', 'Admin', 'User', 'admin@example.com')
          `);
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') throw err;
        }

        try {
          // Insert sample departments
          await pool.query(`
            INSERT INTO departments (department_code, department_name, gross_salary, total_deduction, net_salary)
            VALUES
            ('ENG', 'Engineering', 75000.00, 15000.00, 60000.00),
            ('HR', 'Human Resources', 65000.00, 13000.00, 52000.00),
            ('FIN', 'Finance', 70000.00, 14000.00, 56000.00),
            ('MKT', 'Marketing', 60000.00, 12000.00, 48000.00)
          `);
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') throw err;
        }

        try {
          // Insert sample employees
          await pool.query(`
            INSERT INTO employees (employee_number, first_name, last_name, position, address, telephone, gender, hired_date, department_code)
            VALUES
            ('EMP001', 'John', 'Doe', 'Software Engineer', '123 Main St', '555-0101', 'Male', '2023-01-15', 'ENG'),
            ('EMP002', 'Jane', 'Smith', 'HR Manager', '456 Oak Ave', '555-0102', 'Female', '2023-02-01', 'HR'),
            ('EMP003', 'Mike', 'Johnson', 'Financial Analyst', '789 Pine Rd', '555-0103', 'Male', '2023-03-10', 'FIN'),
            ('EMP004', 'Sarah', 'Williams', 'Marketing Specialist', '321 Elm St', '555-0104', 'Female', '2023-04-05', 'MKT'),
            ('EMP005', 'David', 'Brown', 'Senior Developer', '654 Maple Dr', '555-0105', 'Male', '2023-01-20', 'ENG'),
            ('EMP006', 'Lisa', 'Davis', 'Accountant', '987 Cedar Ln', '555-0106', 'Female', '2023-05-15', 'FIN')
          `);
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') throw err;
        }



        try {
          // Insert sample salaries
          await pool.query(`
            INSERT INTO salaries (employee_number, gross_salary, total_deduction, net_salary, month)
            VALUES
            ('EMP001', 75000.00, 15000.00, 60000.00, '2023-01-01'),
            ('EMP002', 65000.00, 13000.00, 52000.00, '2023-01-01'),
            ('EMP003', 70000.00, 14000.00, 56000.00, '2023-01-01'),
            ('EMP001', 75000.00, 15000.00, 60000.00, '2023-02-01'),
            ('EMP002', 65000.00, 13000.00, 52000.00, '2023-02-01'),
            ('EMP003', 70000.00, 14000.00, 56000.00, '2023-02-01')
          `);
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') throw err;
        }
        }
      } catch (err) {
        console.log('Sample data already exists or error inserting:', err.message);
      }

      console.log('Database and tables created successfully');
    } catch (error) {
      console.error('Error setting up database tables:', error);
      throw error;
    }

    return pool;
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

// Initialize the pool
let pool;
(async () => {
  try {
    pool = await createDatabaseAndTables();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Test route (before middleware)
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

    // Validate input
    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, firstName, lastName, email]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, first_name, last_name, email FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    res.json({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Department routes

// Get all departments
app.get('/api/departments', isAuthenticated, async (_req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments ORDER BY department_name');
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department by code
app.get('/api/departments/:code', isAuthenticated, async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [req.params.code]);

    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(departments[0]);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create department
app.post('/api/departments', isAuthenticated, async (req, res) => {
  try {
    const { departmentCode, departmentName, grossSalary, totalDeduction, netSalary } = req.body;

    // Validate input
    if (!departmentCode || !departmentName || !grossSalary || !totalDeduction || !netSalary) {
      return res.status(400).json({ message: 'Department code, name, gross salary, total deduction, and net salary are required' });
    }

    // Check if department code already exists
    const [existingDepartments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [departmentCode]);

    if (existingDepartments.length > 0) {
      return res.status(400).json({ message: 'Department code already exists' });
    }

    // Insert department
    await pool.query(
      'INSERT INTO departments (department_code, department_name, gross_salary, total_deduction, net_salary) VALUES (?, ?, ?, ?, ?)',
      [departmentCode, departmentName, grossSalary, totalDeduction, netSalary]
    );

    res.status(201).json({ message: 'Department created successfully' });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update department
app.put('/api/departments/:code', isAuthenticated, async (req, res) => {
  try {
    const { departmentName, grossSalary, totalDeduction, netSalary } = req.body;

    // Validate input
    if (!departmentName || !grossSalary || !totalDeduction || !netSalary) {
      return res.status(400).json({ message: 'Department name, gross salary, total deduction, and net salary are required' });
    }

    // Update department
    await pool.query(
      'UPDATE departments SET department_name = ?, gross_salary = ?, total_deduction = ?, net_salary = ? WHERE department_code = ?',
      [departmentName, grossSalary, totalDeduction, netSalary, req.params.code]
    );

    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete department
app.delete('/api/departments/:code', isAuthenticated, async (req, res) => {
  try {
    // Check if department is being used by employees
    const [employees] = await pool.query('SELECT COUNT(*) as count FROM employees WHERE department_code = ?', [req.params.code]);

    if (employees[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete department that has employees assigned to it' });
    }

    // Delete department
    await pool.query('DELETE FROM departments WHERE department_code = ?', [req.params.code]);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee routes

// Get all employees for dropdown selection (must come before /:number route)
app.get('/api/employees/list', isAuthenticated, async (_req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position,
        d.department_name
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      ORDER BY e.last_name, e.first_name
    `);
    res.json(employees);
  } catch (error) {
    console.error('Get employees list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all employees
app.get('/api/employees', isAuthenticated, async (_req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, d.department_name
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      ORDER BY e.last_name, e.first_name
    `);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee with department salary information for salary form auto-population
app.get('/api/employees/:number/salary-info', isAuthenticated, async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position,
        e.department_code,
        d.department_name,
        d.gross_salary,
        d.total_deduction,
        d.net_salary
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      WHERE e.employee_number = ?
    `, [req.params.number]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Get employee salary info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee by number
app.get('/api/employees/:number', isAuthenticated, async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, d.department_name
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      WHERE e.employee_number = ?
    `, [req.params.number]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create employee
app.post('/api/employees', isAuthenticated, async (req, res) => {
  try {
    const { employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode } = req.body;

    // Validate input
    if (!employeeNumber || !firstName || !lastName || !position || !hiredDate || !departmentCode) {
      return res.status(400).json({ message: 'Employee number, first name, last name, position, hired date, and department code are required' });
    }

    // Check if employee number already exists
    const [existingEmployees] = await pool.query('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber]);

    if (existingEmployees.length > 0) {
      return res.status(400).json({ message: 'Employee number already exists' });
    }

    // Check if department exists
    const [departments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [departmentCode]);

    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Insert employee
    await pool.query(
      'INSERT INTO employees (employee_number, first_name, last_name, position, address, telephone, gender, hired_date, department_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode]
    );

    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee
app.put('/api/employees/:number', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode } = req.body;

    // Validate input
    if (!firstName || !lastName || !position || !hiredDate || !departmentCode) {
      return res.status(400).json({ message: 'First name, last name, position, hired date, and department code are required' });
    }

    // Check if department exists
    const [departments] = await pool.query('SELECT * FROM departments WHERE department_code = ?', [departmentCode]);

    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update employee
    await pool.query(
      'UPDATE employees SET first_name = ?, last_name = ?, position = ?, address = ?, telephone = ?, gender = ?, hired_date = ?, department_code = ? WHERE employee_number = ?',
      [firstName, lastName, position, address, telephone, gender, hiredDate, departmentCode, req.params.number]
    );

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
app.delete('/api/employees/:number', isAuthenticated, async (req, res) => {
  try {
    // Delete employee (cascade will delete related salaries)
    await pool.query('DELETE FROM employees WHERE employee_number = ?', [req.params.number]);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Salary routes

// Get all salaries
app.get('/api/salaries', isAuthenticated, async (_req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT s.*, e.first_name, e.last_name, e.position, d.department_name
      FROM salaries s
      JOIN employees e ON s.employee_number = e.employee_number
      JOIN departments d ON e.department_code = d.department_code
      ORDER BY s.month DESC, e.last_name, e.first_name
    `);

    res.json(salaries);
  } catch (error) {
    console.error('Get salaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get salaries by employee number
app.get('/api/employees/:number/salaries', isAuthenticated, async (req, res) => {
  try {
    const [salaries] = await pool.query(
      'SELECT * FROM salaries WHERE employee_number = ? ORDER BY month DESC',
      [req.params.number]
    );

    res.json(salaries);
  } catch (error) {
    console.error('Get employee salaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create salary
app.post('/api/salaries', isAuthenticated, async (req, res) => {
  try {
    const { employeeNumber, grossSalary, totalDeduction, netSalary, month } = req.body;

    // Validate input
    if (!employeeNumber || !grossSalary || !totalDeduction || !netSalary || !month) {
      return res.status(400).json({ message: 'Employee number, gross salary, total deduction, net salary, and month are required' });
    }

    // Validate numeric values
    if (isNaN(grossSalary) || isNaN(totalDeduction) || isNaN(netSalary)) {
      return res.status(400).json({ message: 'Salary amounts must be valid numbers' });
    }

    // Validate that gross salary minus deduction equals net salary
    const calculatedNet = parseFloat(grossSalary) - parseFloat(totalDeduction);
    if (Math.abs(calculatedNet - parseFloat(netSalary)) > 0.01) {
      return res.status(400).json({ message: 'Net salary must equal gross salary minus total deduction' });
    }

    // Check if employee exists
    const [employees] = await pool.query('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if salary for this employee and month already exists
    const [existingSalaries] = await pool.query(
      'SELECT * FROM salaries WHERE employee_number = ? AND DATE_FORMAT(month, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")',
      [employeeNumber, month]
    );

    if (existingSalaries.length > 0) {
      return res.status(400).json({
        message: 'Employee has already been paid for this month. Cannot pay the same employee twice in the same month.',
        existingPayment: existingSalaries[0]
      });
    }

    // Insert salary
    const [result] = await pool.query(
      'INSERT INTO salaries (employee_number, gross_salary, total_deduction, net_salary, month) VALUES (?, ?, ?, ?, ?)',
      [employeeNumber, grossSalary, totalDeduction, netSalary, month]
    );

    res.status(201).json({ message: 'Salary created successfully', salaryId: result.insertId });
  } catch (error) {
    console.error('Create salary error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Employee has already been paid for this month' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update salary
app.put('/api/salaries/:id', isAuthenticated, async (req, res) => {
  try {
    const { grossSalary, totalDeduction, netSalary, month } = req.body;

    // Validate input
    if (!grossSalary || !totalDeduction || !netSalary || !month) {
      return res.status(400).json({ message: 'Gross salary, total deduction, net salary, and month are required' });
    }

    // Update salary
    await pool.query(
      'UPDATE salaries SET gross_salary = ?, total_deduction = ?, net_salary = ?, month = ? WHERE id = ?',
      [grossSalary, totalDeduction, netSalary, month, req.params.id]
    );

    res.json({ message: 'Salary updated successfully' });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete salary
app.delete('/api/salaries/:id', isAuthenticated, async (req, res) => {
  try {
    await pool.query('DELETE FROM salaries WHERE id = ?', [req.params.id]);

    res.json({ message: 'Salary deleted successfully' });
  } catch (error) {
    console.error('Delete salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reports

// Get monthly payroll report
app.get('/api/reports/monthly-payroll', isAuthenticated, async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM-DD format)' });
    }

    const [report] = await pool.query(`
      SELECT
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position,
        e.address,
        e.telephone,
        e.gender,
        e.hired_date,
        d.department_code,
        d.department_name,
        s.gross_salary,
        s.total_deduction,
        s.net_salary,
        s.month,
        s.created_at as payment_date
      FROM salaries s
      JOIN employees e ON s.employee_number = e.employee_number
      JOIN departments d ON e.department_code = d.department_code
      WHERE DATE_FORMAT(s.month, '%Y-%m-01') = DATE_FORMAT(?, '%Y-%m-01')
      ORDER BY d.department_name, e.last_name, e.first_name
    `, [month]);

    res.json(report);
  } catch (error) {
    console.error('Monthly payroll report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get printable monthly payroll report with signature
app.get('/api/reports/monthly-payroll/print', isAuthenticated, async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM-DD format)' });
    }

    const [report] = await pool.query(`
      SELECT
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position,
        d.department_code,
        d.department_name,
        s.gross_salary,
        s.total_deduction,
        s.net_salary,
        s.month
      FROM salaries s
      JOIN employees e ON s.employee_number = e.employee_number
      JOIN departments d ON e.department_code = d.department_code
      WHERE DATE_FORMAT(s.month, '%Y-%m-01') = DATE_FORMAT(?, '%Y-%m-01')
      ORDER BY d.department_name, e.last_name, e.first_name
    `, [month]);

    // Calculate totals
    const totals = report.reduce((acc, row) => {
      acc.totalGross += parseFloat(row.gross_salary);
      acc.totalDeduction += parseFloat(row.total_deduction);
      acc.totalNet += parseFloat(row.net_salary);
      return acc;
    }, { totalGross: 0, totalDeduction: 0, totalNet: 0 });

    const reportData = {
      month: month,
      reportDate: new Date().toISOString().split('T')[0],
      employees: report,
      totals: totals,
      employeeCount: report.length,
      signature: {
        preparedBy: 'HR Department',
        approvedBy: 'Finance Manager',
        date: new Date().toISOString().split('T')[0]
      }
    };

    res.json(reportData);
  } catch (error) {
    console.error('Printable monthly payroll report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department summary
app.get('/api/reports/departments', isAuthenticated, async (_req, res) => {
  try {
    const [departments] = await pool.query(`
      SELECT
        d.department_code,
        d.department_name,
        d.gross_salary,
        d.total_deduction,
        d.net_salary,
        COUNT(e.employee_number) as employee_count,
        AVG(s.gross_salary) as average_gross_salary,
        AVG(s.total_deduction) as average_deduction,
        AVG(s.net_salary) as average_net_salary
      FROM departments d
      LEFT JOIN employees e ON d.department_code = e.department_code
      LEFT JOIN (
        SELECT employee_number, gross_salary, total_deduction, net_salary
        FROM salaries s1
        WHERE (employee_number, month) IN (
          SELECT employee_number, MAX(month)
          FROM salaries
          GROUP BY employee_number
        )
      ) s ON e.employee_number = s.employee_number
      GROUP BY d.department_code, d.department_name, d.gross_salary, d.total_deduction, d.net_salary
      ORDER BY d.department_name
    `);

    res.json(departments);
  } catch (error) {
    console.error('Department report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee salary history report
app.get('/api/reports/employee-salary-history/:employeeNumber', isAuthenticated, async (req, res) => {
  try {
    const { employeeNumber } = req.params;

    const [employee] = await pool.query(`
      SELECT
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position,
        e.address,
        e.telephone,
        e.gender,
        e.hired_date,
        d.department_code,
        d.department_name
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      WHERE e.employee_number = ?
    `, [employeeNumber]);

    if (employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const [salaryHistory] = await pool.query(`
      SELECT
        gross_salary,
        total_deduction,
        net_salary,
        month,
        created_at as payment_date
      FROM salaries
      WHERE employee_number = ?
      ORDER BY month DESC
    `, [employeeNumber]);

    res.json({
      employee: employee[0],
      salaryHistory: salaryHistory,
      totalPayments: salaryHistory.length
    });
  } catch (error) {
    console.error('Employee salary history report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get printable employee salary history report
app.get('/api/reports/employee-salary-history/:employeeNumber/print', isAuthenticated, async (req, res) => {
  try {
    const { employeeNumber } = req.params;

    const [employee] = await pool.query(`
      SELECT
        e.employee_number,
        e.first_name,
        e.last_name,
        e.position,
        e.address,
        e.telephone,
        e.gender,
        e.hired_date,
        d.department_code,
        d.department_name
      FROM employees e
      JOIN departments d ON e.department_code = d.department_code
      WHERE e.employee_number = ?
    `, [employeeNumber]);

    if (employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const [salaryHistory] = await pool.query(`
      SELECT
        gross_salary,
        total_deduction,
        net_salary,
        month
      FROM salaries
      WHERE employee_number = ?
      ORDER BY month DESC
    `, [employeeNumber]);

    // Calculate totals
    const totals = salaryHistory.reduce((acc, row) => {
      acc.totalGross += parseFloat(row.gross_salary);
      acc.totalDeduction += parseFloat(row.total_deduction);
      acc.totalNet += parseFloat(row.net_salary);
      return acc;
    }, { totalGross: 0, totalDeduction: 0, totalNet: 0 });

    const reportData = {
      reportDate: new Date().toISOString().split('T')[0],
      employee: employee[0],
      salaryHistory: salaryHistory,
      totals: totals,
      totalPayments: salaryHistory.length,
      signature: {
        preparedBy: 'HR Department',
        approvedBy: 'Finance Manager',
        date: new Date().toISOString().split('T')[0]
      }
    };

    res.json(reportData);
  } catch (error) {
    console.error('Printable employee salary history report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if employee has been paid for a specific month
app.get('/api/salaries/check/:employeeNumber/:month', isAuthenticated, async (req, res) => {
  try {
    const { employeeNumber, month } = req.params;

    const [existingSalaries] = await pool.query(
      'SELECT * FROM salaries WHERE employee_number = ? AND DATE_FORMAT(month, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")',
      [employeeNumber, month]
    );

    res.json({
      hasPaid: existingSalaries.length > 0,
      payment: existingSalaries.length > 0 ? existingSalaries[0] : null
    });
  } catch (error) {
    console.error('Check salary payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics
app.get('/api/dashboard/stats', isAuthenticated, async (_req, res) => {
  try {
    // Get total employees
    const [employeeCount] = await pool.query('SELECT COUNT(*) as count FROM employees');

    // Get total departments
    const [departmentCount] = await pool.query('SELECT COUNT(*) as count FROM departments');

    // Get current month payments
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const [currentMonthPayments] = await pool.query(
      'SELECT COUNT(*) as count FROM salaries WHERE DATE_FORMAT(month, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")',
      [currentMonth]
    );

    // Get total payroll for current month
    const [currentMonthTotal] = await pool.query(
      'SELECT SUM(net_salary) as total FROM salaries WHERE DATE_FORMAT(month, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")',
      [currentMonth]
    );

    res.json({
      totalEmployees: employeeCount[0].count,
      totalDepartments: departmentCount[0].count,
      currentMonthPayments: currentMonthPayments[0].count,
      currentMonthTotal: currentMonthTotal[0].total || 0
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});