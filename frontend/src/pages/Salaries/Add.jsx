import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { salaryAPI, employeeAPI } from '../../utils/api';

const AddSalary = () => {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    grossSalary: '',
    totalDeduction: '',
    netSalary: '',
    month: '',
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [paymentCheck, setPaymentCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await employeeAPI.getList();
        setEmployees(data);
      } catch (err) {
        setError('Failed to load employees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Check payment when employee or month changes
  useEffect(() => {
    const checkPayment = async () => {
      if (formData.employeeNumber && formData.month) {
        try {
          const result = await salaryAPI.checkPayment(formData.employeeNumber, formData.month);
          setPaymentCheck(result);
          if (result.hasPaid) {
            setWarning(`This employee has already been paid for ${new Date(formData.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`);
          } else {
            setWarning(null);
          }
        } catch (err) {
          console.error('Error checking payment:', err);
        }
      }
    };

    checkPayment();
  }, [formData.employeeNumber, formData.month]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Auto-calculate net salary when gross salary or total deduction changes
      if (name === 'grossSalary' || name === 'totalDeduction') {
        const gross = parseFloat(name === 'grossSalary' ? value : newData.grossSalary) || 0;
        const deduction = parseFloat(name === 'totalDeduction' ? value : newData.totalDeduction) || 0;
        newData.netSalary = (gross - deduction).toFixed(2);
      }

      return newData;
    });
  };

  const handleEmployeeChange = async (e) => {
    const employeeNumber = e.target.value;
    setFormData(prev => ({ ...prev, employeeNumber }));

    if (employeeNumber) {
      try {
        // Get employee salary info for auto-population
        const employeeInfo = await employeeAPI.getSalaryInfo(employeeNumber);
        setSelectedEmployee(employeeInfo);

        // Auto-populate department salary information
        setFormData(prev => ({
          ...prev,
          employeeNumber,
          grossSalary: employeeInfo.gross_salary.toString(),
          totalDeduction: employeeInfo.total_deduction.toString(),
          netSalary: employeeInfo.net_salary.toString(),
        }));
      } catch (err) {
        console.error('Error fetching employee info:', err);
        setSelectedEmployee(null);
      }
    } else {
      setSelectedEmployee(null);
      setFormData(prev => ({
        ...prev,
        employeeNumber: '',
        grossSalary: '',
        totalDeduction: '',
        netSalary: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.employeeNumber || !formData.grossSalary || !formData.totalDeduction || !formData.netSalary || !formData.month) {
      setError('All fields are required');
      return;
    }

    // Check if employee has already been paid for this month
    if (paymentCheck && paymentCheck.hasPaid) {
      setError('Cannot pay the same employee twice in the same month');
      return;
    }

    try {
      setSaving(true);
      await salaryAPI.create(formData);
      navigate('/salaries');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create salary record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-xl">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Add Salary Payment</h1>
        <Link
          to="/salaries"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Salaries
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {warning && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex items-center" role="alert">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="block sm:inline">{warning}</span>
        </div>
      )}

      {selectedEmployee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Selected Employee Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Name:</span>
              <p className="text-blue-800">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Position:</span>
              <p className="text-blue-800">{selectedEmployee.position}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Department:</span>
              <p className="text-blue-800">{selectedEmployee.department_name}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Employee #:</span>
              <p className="text-blue-800">{selectedEmployee.employee_number}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700">
                Employee *
              </label>
              <select
                id="employeeNumber"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleEmployeeChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.employee_number} value={employee.employee_number}>
                    {employee.first_name} {employee.last_name} - {employee.position} ({employee.department_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                Payment Month *
              </label>
              <input
                type="month"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Select the month for this salary payment.
              </p>
            </div>

            <div>
              <label htmlFor="grossSalary" className="block text-sm font-medium text-gray-700">
                Gross Salary *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="grossSalary"
                  name="grossSalary"
                  step="0.01"
                  min="0"
                  value={formData.grossSalary}
                  onChange={handleChange}
                  className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Auto-populated from department settings.
              </p>
            </div>

            <div>
              <label htmlFor="totalDeduction" className="block text-sm font-medium text-gray-700">
                Total Deduction *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="totalDeduction"
                  name="totalDeduction"
                  step="0.01"
                  min="0"
                  value={formData.totalDeduction}
                  onChange={handleChange}
                  className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Total deductions (taxes, insurance, etc.).
              </p>
            </div>

            <div>
              <label htmlFor="netSalary" className="block text-sm font-medium text-gray-700">
                Net Salary *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="netSalary"
                  name="netSalary"
                  step="0.01"
                  min="0"
                  value={formData.netSalary}
                  onChange={handleChange}
                  className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  required
                  readOnly
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Net salary (automatically calculated).
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || (paymentCheck && paymentCheck.hasPaid)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                paymentCheck && paymentCheck.hasPaid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Processing...' : paymentCheck && paymentCheck.hasPaid ? 'Already Paid' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalary;
