import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios
axios.defaults.withCredentials = true;

// Department API
export const departmentAPI = {
  // Get all departments
  getAll: async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get department by code
  getByCode: async (code) => {
    try {
      const res = await axios.get(`${API_URL}/departments/${code}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Create department
  create: async (departmentData) => {
    try {
      const res = await axios.post(`${API_URL}/departments`, departmentData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Update department
  update: async (code, departmentData) => {
    try {
      const res = await axios.put(`${API_URL}/departments/${code}`, departmentData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete department
  delete: async (code) => {
    try {
      const res = await axios.delete(`${API_URL}/departments/${code}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

// Employee API
export const employeeAPI = {
  // Get all employees
  getAll: async () => {
    try {
      const res = await axios.get(`${API_URL}/employees`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee by number
  getByNumber: async (number) => {
    try {
      const res = await axios.get(`${API_URL}/employees/${number}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee with salary info for auto-population
  getSalaryInfo: async (number) => {
    try {
      const res = await axios.get(`${API_URL}/employees/${number}/salary-info`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employees list for dropdown
  getList: async () => {
    try {
      const res = await axios.get(`${API_URL}/employees/list`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Create employee
  create: async (employeeData) => {
    try {
      const res = await axios.post(`${API_URL}/employees`, employeeData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Update employee
  update: async (number, employeeData) => {
    try {
      const res = await axios.put(`${API_URL}/employees/${number}`, employeeData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete employee
  delete: async (number) => {
    try {
      const res = await axios.delete(`${API_URL}/employees/${number}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

// Salary API
export const salaryAPI = {
  // Get all salaries
  getAll: async () => {
    try {
      const res = await axios.get(`${API_URL}/salaries`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get salaries by employee number
  getByEmployeeNumber: async (employeeNumber) => {
    try {
      const res = await axios.get(`${API_URL}/employees/${employeeNumber}/salaries`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if employee has been paid for a specific month
  checkPayment: async (employeeNumber, month) => {
    try {
      const res = await axios.get(`${API_URL}/salaries/check/${employeeNumber}/${month}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Create salary
  create: async (salaryData) => {
    try {
      const res = await axios.post(`${API_URL}/salaries`, salaryData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Update salary
  update: async (id, salaryData) => {
    try {
      const res = await axios.put(`${API_URL}/salaries/${id}`, salaryData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete salary
  delete: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/salaries/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

// Reports API
export const reportAPI = {
  // Get department summary
  getDepartmentSummary: async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/departments`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get monthly payroll report
  getMonthlyPayroll: async (month) => {
    try {
      const res = await axios.get(`${API_URL}/reports/monthly-payroll?month=${month}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get printable monthly payroll report
  getMonthlyPayrollPrint: async (month) => {
    try {
      const res = await axios.get(`${API_URL}/reports/monthly-payroll/print?month=${month}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee salary history
  getEmployeeSalaryHistory: async (employeeNumber) => {
    try {
      const res = await axios.get(`${API_URL}/reports/employee-salary-history/${employeeNumber}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Get printable employee salary history
  getEmployeeSalaryHistoryPrint: async (employeeNumber) => {
    try {
      const res = await axios.get(`${API_URL}/reports/employee-salary-history/${employeeNumber}/print`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard/stats`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
