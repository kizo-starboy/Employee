import { useState, useEffect } from 'react';
import { BarChartBig, Users, DollarSign, Calendar, FileText, Printer, Download, Building2 } from 'lucide-react';
import { reportAPI, employeeAPI } from '../utils/api';

const Reports = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeSalaryHistory, setEmployeeSalaryHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch employees list
        const employeesData = await employeeAPI.getList();
        setEmployees(employeesData);

        // Fetch department summary
        const deptData = await reportAPI.getDepartmentSummary();
        setDepartmentData(deptData);

        // Fetch monthly payroll report
        const reportData = await reportAPI.getMonthlyPayroll(selectedMonth);
        setMonthlyReport(reportData);
      } catch (err) {
        setError('Failed to load report data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchMonthlyReport = async () => {
      try {
        const reportData = await reportAPI.getMonthlyPayroll(selectedMonth);
        setMonthlyReport(reportData);
      } catch (err) {
        console.error('Failed to load monthly report:', err);
      }
    };

    fetchMonthlyReport();
  }, [selectedMonth]);

  useEffect(() => {
    const fetchEmployeeSalaryHistory = async () => {
      if (selectedEmployee) {
        try {
          const historyData = await reportAPI.getEmployeeSalaryHistory(selectedEmployee);
          setEmployeeSalaryHistory(historyData);
        } catch (err) {
          console.error('Failed to load employee salary history:', err);
          setEmployeeSalaryHistory(null);
        }
      } else {
        setEmployeeSalaryHistory(null);
      }
    };

    fetchEmployeeSalaryHistory();
  }, [selectedEmployee]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  // Calculate total employees and average salary
  const totalEmployees = departmentData.reduce((sum, dept) => sum + (dept.employee_count || 0), 0);
  const totalDepartments = departmentData.length;
  const averageNetSalary = departmentData.length > 0
    ? departmentData.reduce((sum, dept) => sum + (parseFloat(dept.average_net_salary) || 0), 0) / departmentData.length
    : 0;

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handlePrintMonthlyReport = async () => {
    try {
      const printData = await reportAPI.getMonthlyPayrollPrint(selectedMonth);

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Monthly Payroll Report - ${formatDate(selectedMonth)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .report-title { font-size: 18px; margin-bottom: 5px; }
            .report-date { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .totals { margin-top: 20px; font-weight: bold; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Employee Payroll Management System</div>
            <div class="report-title">Monthly Payroll Report</div>
            <div class="report-date">Report Period: ${formatDate(selectedMonth)}</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee #</th>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Gross Salary</th>
                <th>Total Deduction</th>
                <th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              ${printData.employees.map(emp => `
                <tr>
                  <td>${emp.employee_number}</td>
                  <td>${emp.first_name} ${emp.last_name}</td>
                  <td>${emp.position}</td>
                  <td>${emp.department_name}</td>
                  <td>${formatCurrency(emp.gross_salary)}</td>
                  <td>${formatCurrency(emp.total_deduction)}</td>
                  <td>${formatCurrency(emp.net_salary)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Total Employees: ${printData.employeeCount}</p>
            <p>Total Gross Salary: ${formatCurrency(printData.totals.totalGross)}</p>
            <p>Total Deductions: ${formatCurrency(printData.totals.totalDeduction)}</p>
            <p>Total Net Salary: ${formatCurrency(printData.totals.totalNet)}</p>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Prepared By</div>
              <div>${printData.signature.preparedBy}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Approved By</div>
              <div>${printData.signature.approvedBy}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Date</div>
              <div>${printData.signature.date}</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      console.error('Failed to generate print report:', err);
      alert('Failed to generate print report');
    }
  };

  const handlePrintEmployeeHistory = async () => {
    if (!selectedEmployee) return;

    try {
      const printData = await reportAPI.getEmployeeSalaryHistoryPrint(selectedEmployee);

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Employee Salary History - ${printData.employee.first_name} ${printData.employee.last_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .report-title { font-size: 18px; margin-bottom: 5px; }
            .employee-info { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .employee-info h3 { margin-top: 0; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .totals { margin-top: 20px; font-weight: bold; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Employee Payroll Management System</div>
            <div class="report-title">Employee Salary History Report</div>
            <div class="report-date">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="employee-info">
            <h3>Employee Information</h3>
            <div class="info-grid">
              <div><strong>Employee Number:</strong> ${printData.employee.employee_number}</div>
              <div><strong>Name:</strong> ${printData.employee.first_name} ${printData.employee.last_name}</div>
              <div><strong>Position:</strong> ${printData.employee.position}</div>
              <div><strong>Department:</strong> ${printData.employee.department_name}</div>
              <div><strong>Address:</strong> ${printData.employee.address}</div>
              <div><strong>Phone:</strong> ${printData.employee.telephone}</div>
              <div><strong>Gender:</strong> ${printData.employee.gender}</div>
              <div><strong>Hire Date:</strong> ${new Date(printData.employee.hired_date).toLocaleDateString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Payment Month</th>
                <th>Gross Salary</th>
                <th>Total Deduction</th>
                <th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              ${printData.salaryHistory.map(payment => `
                <tr>
                  <td>${new Date(payment.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</td>
                  <td>${formatCurrency(payment.gross_salary)}</td>
                  <td>${formatCurrency(payment.total_deduction)}</td>
                  <td>${formatCurrency(payment.net_salary)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Total Payments: ${printData.totalPayments}</p>
            <p>Total Gross Salary: ${formatCurrency(printData.totals.totalGross)}</p>
            <p>Total Deductions: ${formatCurrency(printData.totals.totalDeduction)}</p>
            <p>Total Net Salary: ${formatCurrency(printData.totals.totalNet)}</p>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Prepared By</div>
              <div>${printData.signature.preparedBy}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Approved By</div>
              <div>${printData.signature.approvedBy}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Date</div>
              <div>${printData.signature.date}</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (err) {
      console.error('Failed to generate employee history print:', err);
      alert('Failed to generate employee history print');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-xl">Loading report data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Reports</h1>
        <p className="text-gray-600">Generate and print comprehensive payroll reports</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Net Salary</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(averageNetSalary)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDepartments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Payroll Report */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Monthly Payroll Report</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <input
                type="month"
                value={selectedMonth.slice(0, 7)}
                onChange={(e) => handleMonthChange(e.target.value + '-01')}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handlePrintMonthlyReport}
              disabled={monthlyReport.length === 0}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                monthlyReport.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deduction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyReport.length > 0 ? (
                monthlyReport.map((employee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employee_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(employee.gross_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(employee.total_deduction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(employee.net_salary)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No payroll data available for {formatDate(selectedMonth)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Salary History */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Employee Salary History</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.employee_number} value={employee.employee_number}>
                  {employee.first_name} {employee.last_name} - {employee.position}
                </option>
              ))}
            </select>
            <button
              onClick={handlePrintEmployeeHistory}
              disabled={!selectedEmployee || !employeeSalaryHistory}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                !selectedEmployee || !employeeSalaryHistory
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </button>
          </div>
        </div>

        {employeeSalaryHistory && (
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Employee Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Employee #:</span>
                  <p className="text-blue-800">{employeeSalaryHistory.employee.employee_number}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Name:</span>
                  <p className="text-blue-800">{employeeSalaryHistory.employee.first_name} {employeeSalaryHistory.employee.last_name}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Position:</span>
                  <p className="text-blue-800">{employeeSalaryHistory.employee.position}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Department:</span>
                  <p className="text-blue-800">{employeeSalaryHistory.employee.department_name}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Month
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Salary
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Deduction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeSalaryHistory.salaryHistory.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(payment.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payment.gross_salary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payment.total_deduction)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.net_salary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Total Payments:</strong> {employeeSalaryHistory.totalPayments}</p>
            </div>
          </div>
        )}

        {selectedEmployee && !employeeSalaryHistory && (
          <div className="p-6 text-center text-gray-500">
            No salary history found for the selected employee.
          </div>
        )}

        {!selectedEmployee && (
          <div className="p-6 text-center text-gray-500">
            Please select an employee to view their salary history.
          </div>
        )}
      </div>

      {/* Department Summary Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Department Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Deduction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Gross
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Deduction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Net
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.length > 0 ? (
                departmentData.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.employee_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.gross_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.total_deduction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.net_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.average_gross_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.average_deduction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.average_net_salary)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                    No department data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
