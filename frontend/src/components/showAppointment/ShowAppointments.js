import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ENDPOINTS } from "../../apiConfig"; // Removed unused API_BASE_URL
import "./ShowAppointments.css";

const ShowAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(ENDPOINTS.APPOINTMENTS(userId));
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((app) => {
    if (filter === "All") return true;
    return app.appointment_type?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="appointments-page">
      <div className="appointments-container">
        <header className="page-header">
          <div className="header-text">
            <h1>My Appointments</h1>
            <p>Track and manage your upcoming consultations.</p>
          </div>
          <div className="filter-group">
            {["All", "Online", "Clinic"].map((type) => (
              <button 
                key={type}
                className={`filter-btn ${filter === type ? "active" : ""}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </header>

        {appointments.length === 0 ? (
          <div className="empty-appointments">
            <div className="empty-icon">📅</div>
            <h3>No appointments found</h3>
            <button className="book-now-empty" onClick={() => navigate("/")}>
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.map((app) => (
              <div className="appointment-card" key={app.id}>
                <div className="app-main-info">
                  <div className="doctor-mini-profile">
                    <img 
                      src={app.doctor_image || "/img/logo.png"} 
                      alt={app.doctor_name} 
                      className="mini-doc-img"
                    />
                    <div className="mini-doc-details">
                      <h4>{app.doctor_name}</h4>
                      <span className="app-type-badge">{app.appointment_type}</span>
                    </div>
                  </div>
                  
                  <div className="app-schedule">
                    <div className="schedule-item">
                      <span className="s-icon">📅</span>
                      <div className="s-text">
                        <label>Date</label>
                        <p>{new Date(app.appointment_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <span className="s-icon">⏰</span>
                      <div className="s-text">
                        <label>Time</label>
                        <p>{app.start_time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="app-patient-details">
                  <div className="p-info-item">
                    <label>Reference</label>
                    <p>#{app.id}</p>
                  </div>
                  <div className="p-info-item">
                    <label>Status</label>
                    <span className="status-pill confirmed">Confirmed</span>
                  </div>
                  <div className="app-actions">
                    <button 
                      className="view-receipt-btn"
                      onClick={() => navigate(`/doctor/${app.doctor_id}`)}
                    >
                      View Doctor
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowAppointments;