import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { departmentAPI } from '../../utils/api';

const AddDepartment = () => {
  const [formData, setFormData] = useState({
    departmentCode: '',
    departmentName: '',
    grossSalary: '',
    totalDeduction: '',
    netSalary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.departmentCode || !formData.departmentName || !formData.grossSalary || !formData.totalDeduction || !formData.netSalary) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      await departmentAPI.create(formData);
      navigate('/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Add Department</h1>
        <Link
          to="/departments"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Departments
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="departmentCode" className="block text-sm font-medium text-gray-700">
                Department Code *
              </label>
              <input
                type="text"
                id="departmentCode"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                required
                maxLength="10"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum 10 characters. This will be used as a unique identifier.
              </p>
            </div>

            <div>
              <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">
                Department Name *
              </label>
              <input
                type="text"
                id="departmentName"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                required
              />
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
                  value={formData.grossSalary}
                  onChange={handleChange}
                  className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Base gross salary for this department.
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
                  value={formData.totalDeduction}
                  onChange={handleChange}
                  className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="0.01"
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
                  value={formData.netSalary}
                  onChange={handleChange}
                  className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  required
                  min="0"
                  step="0.01"
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
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
