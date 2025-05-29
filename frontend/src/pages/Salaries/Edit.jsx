import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { salaryAPI } from '../../utils/api';

const EditSalary = () => {
  const [formData, setFormData] = useState({
    grossSalary: '',
    totalDeduction: '',
    netSalary: '',
    month: '',
  });
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        setLoading(true);
        const salaries = await salaryAPI.getAll();
        const salary = salaries.find(s => s.id.toString() === id);

        if (!salary) {
          setError('Salary record not found');
          return;
        }

        setFormData({
          grossSalary: salary.gross_salary || '',
          totalDeduction: salary.total_deduction || '',
          netSalary: salary.net_salary || '',
          month: salary.month ? salary.month.split('T')[0] : '',
        });

        setEmployeeName(`${salary.first_name} ${salary.last_name}`);
      } catch (err) {
        setError('Failed to load salary data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalary();
  }, [id]);

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
    if (!formData.grossSalary || !formData.totalDeduction || !formData.netSalary || !formData.month) {
      setError('All fields are required');
      return;
    }

    try {
      setSaving(true);
      await salaryAPI.update(id, formData);
      navigate('/salaries');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update salary record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-xl">Loading salary data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Salary Record</h1>
        <Link
          to="/salaries"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Salaries
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Employee
              </label>
              <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-700">
                {employeeName}
              </div>
            </div>

            <div>
              <label htmlFor="grossSalary" className="block text-sm font-medium text-gray-700">
                Gross Salary *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">RWF</span>
                </div>
                <input
                  type="number"
                  id="grossSalary"
                  name="grossSalary"
                  step="0.01"
                  min="0"
                  value={formData.grossSalary}
                  onChange={handleChange}
                  className="pl-12 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="totalDeduction" className="block text-sm font-medium text-gray-700">
                Total Deduction *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">RWF</span>
                </div>
                <input
                  type="number"
                  id="totalDeduction"
                  name="totalDeduction"
                  step="0.01"
                  min="0"
                  value={formData.totalDeduction}
                  onChange={handleChange}
                  className="pl-12 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="netSalary" className="block text-sm font-medium text-gray-700">
                Net Salary *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">RWF</span>
                </div>
                <input
                  type="number"
                  id="netSalary"
                  name="netSalary"
                  step="0.01"
                  min="0"
                  value={formData.netSalary}
                  onChange={handleChange}
                  className="pl-12 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 bg-gray-100"
                  readOnly
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Automatically calculated (Gross Salary - Total Deduction)
              </p>
            </div>

            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                Month *
              </label>
              <input
                type="date"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalary;
