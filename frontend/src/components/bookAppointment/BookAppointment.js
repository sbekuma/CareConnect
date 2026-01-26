import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import "./BookAppointment.css";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_age: "",
    patient_gender: "Male",
    appointment_date: "",
    appointment_time: "",
    appointment_type: "Online",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        // Updated to use centralized API_BASE_URL
        const res = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const userId = localStorage.getItem("userId");
    
    try {
      // Updated to use centralized API_BASE_URL and match the server.js route
      await axios.post(`${API_BASE_URL}/appointments`, {
        ...formData,
        doctor_id: doctorId,
        user_id: userId,
      });
      navigate("/appointments");
    } catch (err) {
      console.error("Booking failed:", err);
      // Custom message box instead of alert
      console.error("Booking failed. Ensure your backend server is running and the route is defined.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (!doctor) return <div className="error-view">Doctor not found.</div>;

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Sidebar: Doctor Summary */}
        <aside className="doctor-summary-aside">
          <div className="summary-card">
            <div className="summary-header">
              <img src={doctor.image_url} alt={doctor.name} className="summary-img" />
              <div className="summary-titles">
                <span className="status-indicator">Available Today</span>
                <h3>{doctor.name}</h3>
                <p className="specialty-label">{doctor.specialties?.split(',')[0]}</p>
              </div>
            </div>
            
            <div className="summary-stats">
              <div className="s-stat">
                <span className="s-label">Exp.</span>
                <span className="s-value">{doctor.exp}y</span>
              </div>
              <div className="s-stat">
                <span className="s-label">Rating</span>
                <span className="s-value">⭐ 4.9</span>
              </div>
              <div className="s-stat">
                <span className="s-label">Consults</span>
                <span className="s-value">{doctor.total_patients || '2k+'}</span>
              </div>
            </div>

            <div className="price-breakdown">
              <div className="price-item">
                <span>{formData.appointment_type} Consultation</span>
                <span className="price-bold">
                  ${formData.appointment_type === "Online" ? doctor.online_fee : doctor.visit_fee}
                </span>
              </div>
              <div className="price-item total">
                <span>Total Amount Due</span>
                <span className="price-grand">
                  ${formData.appointment_type === "Online" ? doctor.online_fee : doctor.visit_fee}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main: Booking Form */}
        <main className="booking-form-main">
          <header className="form-header">
            <h2>Complete Your Booking</h2>
            <p>Please fill in the patient details to confirm your slot.</p>
          </header>

          <form className="booking-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <label className="section-title">Patient Information</label>
              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" name="patient_name" placeholder="John Doe"
                    required value={formData.patient_name} onChange={handleChange} 
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" name="patient_phone" placeholder="+1 (555) 000-0000"
                    required value={formData.patient_phone} onChange={handleChange} 
                  />
                </div>
                <div className="input-group">
                  <label>Age</label>
                  <input 
                    type="number" name="patient_age" placeholder="Years"
                    required value={formData.patient_age} onChange={handleChange} 
                  />
                </div>
                <div className="input-group">
                  <label>Gender</label>
                  <select name="patient_gender" value={formData.patient_gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="form-section">
              <label className="section-title">Schedule & Type</label>
              <div className="type-selector">
                <button 
                  type="button" 
                  className={`type-btn ${formData.appointment_type === "Online" ? "active" : ""}`}
                  onClick={() => setFormData({...formData, appointment_type: "Online"})}
                >
                  <span className="icon">💻</span>
                  <div className="text">
                    <strong>Online</strong>
                    <span>Video Consultation</span>
                  </div>
                </button>
                <button 
                  type="button" 
                  className={`type-btn ${formData.appointment_type === "Clinic" ? "active" : ""}`}
                  onClick={() => setFormData({...formData, appointment_type: "Clinic"})}
                >
                  <span className="icon">🏥</span>
                  <div className="text">
                    <strong>Clinic</strong>
                    <span>Physical Visit</span>
                  </div>
                </button>
              </div>

              <div className="form-grid mt-4">
                <div className="input-group">
                  <label>Preferred Date</label>
                  <input 
                    type="date" name="appointment_date" 
                    required value={formData.appointment_date} onChange={handleChange} 
                  />
                </div>
                <div className="input-group">
                  <label>Preferred Time</label>
                  <input 
                    type="time" name="appointment_time" 
                    required value={formData.appointment_time} onChange={handleChange} 
                  />
                </div>
              </div>
            </section>

            <button type="submit" className="submit-booking-btn" disabled={submitting}>
              {submitting ? "Processing..." : "Confirm Appointment"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default BookAppointment;