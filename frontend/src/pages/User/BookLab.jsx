import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';

const BookLab = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useContext(AppContext);
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlot: '',
    notes: ''
  });

  // Check authentication on component mount
  useEffect(() => {
    if (!token || !userData) {
      toast.error('Please login to book appointments');
      localStorage.setItem('redirectAfterLogin', `/book-lab/${id}`);
      navigate('/login');
      return;
    }
    fetchLabDetails();
  }, [id, navigate, token, userData]);

  const fetchLabDetails = async () => {
    try {
      const response = await axios.get(`/api/labs/${id}`);
      setLab(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lab details:', error);
      toast.error('Failed to fetch lab details');
      navigate('/all-labs');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token || !userData) {
        toast.error('Please login to book appointments');
        localStorage.setItem('redirectAfterLogin', `/book-lab/${id}`);
        navigate('/login');
        return;
      }

      const response = await axios.post('/api/labs/book-appointment', {
        labId: id,
        userId: userData._id,
        ...formData
      });

      localStorage.removeItem('redirectAfterLogin');
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. Please contact support.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        console.error('Error booking appointment:', error);
        toast.error(error.response?.data?.message || 'Failed to book appointment');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Book Lab Appointment</h1>
      
      {/* Lab Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <img 
            src={lab.image} 
            alt={lab.name} 
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div>
            <h2 className="text-xl font-semibold mb-2">{lab.name}</h2>
            <p className="text-gray-600 mb-1">{lab.address}</p>
            <p className="text-gray-600 mb-1">{`${lab.city}, ${lab.state}`}</p>
            <p className="text-gray-600">Price: ${lab.price}</p>
          </div>
        </div>
      </div>
      
      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Appointment Date</label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Preferred Time Slot</label>
          <select
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a time slot</option>
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:00">04:00 PM</option>
            <option value="17:00">05:00 PM</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any specific requirements or medical conditions..."
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/all-labs')}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookLab;