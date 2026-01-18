import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorDetails.css';

function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Failed to fetch doctor details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  const handleBookAppointment = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate(`/book-appointment/${id}`);
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="doctor-details-container"><p>Loading doctor details...</p></div>;
  }

  if (!doctor) {
    return <div className="doctor-details-container"><p>Doctor not found</p></div>;
  }

  return (
    <div className="doctor-details">
      <div className="details-container">
        <div className="doctor-header-section">
          <div className="doctor-image-box">
            <img src={doctor.image_url} alt={doctor.name} className="doctor-image" />
          </div>
          
          <div className="doctor-info-section">
            <h1 className="doctor-full-name">{doctor.name}</h1>
            <p className="doctor-bio">{doctor.bio}</p>
            
            <div className="specialties-container">
              <h3>Specialties</h3>
              <div className="specialties-list">
                {doctor.specialties && doctor.specialties.split(',').map((spec, idx) => (
                  <span key={idx} className="specialty-badge">{spec.trim()}</span>
                ))}
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Experience</div>
                <div className="stat-value">{doctor.exp} years</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Patients</div>
                <div className="stat-value">{doctor.total_patients}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pricing-section">
          <h3>Consultation Fees</h3>
          <div className="pricing-grid">
            <div className="price-card online">
              <div className="price-type">💻 Online Consultation</div>
              <div className="price-value">PKR {parseFloat(doctor.online_fee).toFixed(0)}</div>
            </div>
            <div className="price-card clinic">
              <div className="price-type">🏥 Clinic Visit</div>
              <div className="price-value">PKR {parseFloat(doctor.visit_fee).toFixed(0)}</div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-book" onClick={handleBookAppointment}>Book Appointment</button>
          <button className="btn-back" onClick={handleGoBack}>Go Back</button>
        </div>
      </div>
    </div>
  );
}

export default DoctorDetails;
