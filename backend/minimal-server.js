const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ message: 'Login successful', user: { username: 'admin' } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/user', (req, res) => {
  res.json({ username: 'admin', firstName: 'Admin', lastName: 'User' });
});

app.get('/api/employees/list', (req, res) => {
  res.json([
    { employee_number: 'EMP001', first_name: 'John', last_name: 'Doe', position: 'Developer', department_name: 'Engineering' },
    { employee_number: 'EMP002', first_name: 'Jane', last_name: 'Smith', position: 'Manager', department_name: 'HR' }
  ]);
});

app.get('/api/departments', (req, res) => {
  res.json([
    { department_code: 'ENG', department_name: 'Engineering', gross_salary: 75000, total_deduction: 15000, net_salary: 60000 },
    { department_code: 'HR', department_name: 'Human Resources', gross_salary: 65000, total_deduction: 13000, net_salary: 52000 }
  ]);
});

app.get('/api/reports/monthly-payroll', (req, res) => {
  res.json([
    { employee_number: 'EMP001', first_name: 'John', last_name: 'Doe', gross_salary: 75000, total_deduction: 15000, net_salary: 60000 }
  ]);
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
