import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, MapPin, Star, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import "./Home.css";
import Chatbot from "../chatbot/Chatbot";

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
      const res = await axios.get(`${API_BASE_URL}/doctors`, {
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

  const handleBookAppointment = (id) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    navigate(isLoggedIn ? `/book-appointment/${id}` : "/login");
  };

  return (
    <div className="home-wrapper">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Best <br />
            <span className="gradient-text">Medical Expert</span>
          </h1>
          
          <div className="search-container">
            <div className="search-box">
              <div className="search-input-group">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Doctor name..."
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="search-divider"></div>
              <div className="location-group">
                <MapPin size={20} className="location-icon" />
                <span className="location-text">New York, USA</span>
              </div>
              <button className="search-button">Search</button>
            </div>
          </div>
        </div>
      </section>

      <main className="doctors-grid-section">
        {doctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <h3>No specialists found</h3>
            <p>Try adjusting your search to find more options.</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor, idx) => (
              <div 
                className="doctor-card" 
                key={doctor.id}
                ref={idx === doctors.length - 1 ? lastDoctorRef : null}
              >
                <div className="card-image-section">
                  <img src={doctor.image_url} alt={doctor.name} className="doctor-image" />
                  <div className="rating-badge">
                    <Star size={14} className="star-icon" />
                    <span>{doctor.rating || "4.8"}</span>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="doctor-name">{doctor.name}</h3>
                  <p className="doctor-specialty">{doctor.specialties?.split(',')[0]}</p>
                  <div className="doctor-experience">
                    <span>⏱️</span>
                    <span>{doctor.exp} Years Exp.</span>
                  </div>
                </div>

                <p className="doctor-bio">{doctor.bio}</p>

                <div className="pricing-grid">
                  <div className="price-item">
                    <span className="price-label">Online</span>
                    <p className="price-amount">${doctor.online_fee}</p>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Clinic</span>
                    <p className="price-amount">${doctor.visit_fee}</p>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="btn-book-now" onClick={() => handleBookAppointment(doctor.id)}>Book Now</button>
                  <button className="btn-details-icon" onClick={() => navigate(`/doctor/${doctor.id}`)}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Chatbot />
    </div>
  );
};

export default Home;