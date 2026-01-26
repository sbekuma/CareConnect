import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, Clock, User, DollarSign, MapPin, ChevronLeft } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import "./DoctorDetails.css";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <div className="loading-state">Loading specialist profile...</div>;
  if (!doctor) return <div className="error-state">Doctor not found</div>;

  return (
    <div className="details-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={20} /> Back to Search
      </button>

      <div className="details-container">
        <aside className="profile-sidebar">
          <div className="profile-img-container">
            <img src={doctor.image_url} alt={doctor.name} className="profile-img" />
            <div className="rating-tag">
              <Star size={16} fill="currentColor" /> {doctor.rating || "4.9"}
            </div>
          </div>
          
          <button className="primary-book-btn" onClick={() => navigate(`/book-appointment/${doctor.id}`)}>
            Book Appointment Now
          </button>
        </aside>

        <main className="profile-main">
          <header className="profile-header">
            <h1 className="profile-name">{doctor.name}</h1>
            <p className="profile-specialty">{doctor.specialties}</p>
          </header>

          <section className="profile-stats">
            <div className="stat-card">
              <Clock className="stat-icon" />
              <div>
                <h4>Experience</h4>
                <p>{doctor.exp} Years</p>
              </div>
            </div>
            <div className="stat-card">
              <User className="stat-icon" />
              <div>
                <h4>Patients</h4>
                <p>{doctor.total_patients}+</p>
              </div>
            </div>
          </section>

          <section className="profile-bio">
            <h3>Biography</h3>
            <p>{doctor.bio}</p>
          </section>

          <section className="fees-grid">
            <div className="fee-card">
              <div className="fee-header">
                <DollarSign size={18} />
                <span>Online Consultation</span>
              </div>
              <p className="fee-amount">${doctor.online_fee}</p>
            </div>
            <div className="fee-card">
              <div className="fee-header">
                <MapPin size={18} />
                <span>Clinic Visit</span>
              </div>
              <p className="fee-amount">${doctor.visit_fee}</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DoctorDetails;