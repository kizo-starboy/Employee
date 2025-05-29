import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { departmentAPI } from '../../utils/api';

const EditDepartment = () => {
  const [formData, setFormData] = useState({
    departmentName: '',
    grossSalary: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { code } = useParams();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setLoading(true);
        const department = await departmentAPI.getByCode(code);
        
        setFormData({
          departmentName: department.department_name || '',
          grossSalary: department.gross_salary || '',
        });
      } catch (err) {
        setError('Failed to load department data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [code]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.departmentName || !formData.grossSalary) {
      setError('Department name and gross salary are required');
      return;
    }
    
    try {
      setSaving(true);
      await departmentAPI.update(code, formData);
      navigate('/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-xl">Loading department data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Department</h1>
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
              <label className="block text-sm font-medium text-gray-700">
                Department Code
              </label>
              <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-gray-700">
                {code}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Department code cannot be changed.
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
                  className="pl-7 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Base gross salary for this department.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartment;
