import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const LIMIT = 10;

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const navigate = useNavigate();

  const fetchDoctors = async (pageNum, search = "") => {
    try {
      const res = await axios.get("http://localhost:3000/doctors", {
        params: {
          page: pageNum,
          limit: LIMIT,
          search: search.trim()
        },
      });

      const newDocs = res.data;

      if (pageNum === 1) {
        setDoctors(newDocs);
      } else {
        setDoctors((prev) => [...prev, ...newDocs]);
      }

      if (newDocs.length < LIMIT) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  useEffect(() => {
    fetchDoctors(page, searchQuery);
  }, [page, searchQuery]);

  const lastDoctorRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
    setHasMore(true);
    setDoctors([]);
  };

  const handleCardClick = (id) => navigate(`/doctor/${id}`);

  const handleBookAppointment = (id) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    navigate(isLoggedIn ? `/book-appointment/${id}` : "/login");
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-wrapper">
          <div className="hero-text">
            <h1 className="hero-title">Healthcare at Your Fingertips</h1>
            <p className="hero-subtitle">Connect with verified doctors for online consultations and clinic visits</p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-container">
        <div className="search-wrapper">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="doctors-section">
        <div className="doctors-container">
          {doctors.length === 0 && searchQuery ? (
            <div className="no-results">
              <p>No doctors found matching "{searchQuery}"</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="loading-state">
              <p>Loading doctors...</p>
            </div>
          ) : (
            <div className="doctors-grid">
              {doctors.map((doc, idx) => (
                <div
                  className="doctor-card"
                  key={doc.id}
                  ref={idx === doctors.length - 1 ? lastDoctorRef : null}
                >
                  <div className="card-header">
                    <div className="doctor-avatar">
                      <img src={doc.image_url} alt={doc.name} />
                    </div>
                    <div className="doctor-badge">⭐ {doc.exp}y</div>
                  </div>

                  <div className="card-body">
                    <h3 className="doctor-name">{doc.name}</h3>
                    <p className="doctor-specialty">{doc.bio}</p>
                    <div className="specialties-tags">
                      {doc.specialties && doc.specialties.split(",").map((spec, i) => (
                        <span key={i} className="specialty-tag">{spec.trim()}</span>
                      ))}
                    </div>

                    <div className="doctor-stats">
                      <div className="stat">
                        <span className="stat-label">Experience</span>
                        <span className="stat-value">{doc.exp} years</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Patients</span>
                        <span className="stat-value">{doc.total_patients}</span>
                      </div>
                    </div>

                    <div className="pricing-boxes">
                      <div className="price-box">
                        <div className="price-icon">💻</div>
                        <div className="price-info">
                          <div className="price-label">Online</div>
                          <div className="price-amount">${doc.online_fee}</div>
                        </div>
                      </div>
                      <div className="price-box">
                        <div className="price-icon">🏥</div>
                        <div className="price-info">
                          <div className="price-label">Clinic</div>
                          <div className="price-amount">${doc.visit_fee}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button
                      className="btn-secondary"
                      onClick={() => handleCardClick(doc.id)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookAppointment(doc.id);
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {!hasMore && doctors.length > 0 && (
        <div className="end-message">
          <p>✓ All doctors loaded</p>
        </div>
      )}
    </div>
  );
};

export default Home;