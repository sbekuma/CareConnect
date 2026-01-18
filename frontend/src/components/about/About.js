import React, { useState } from "react";
import { motion } from "framer-motion";
import "./About.css"

const stats = [
  { icon: "🏙️", count: "15+", label: "Cities in Pakistan", color: "#e3f5ff", hoverColor: "#b8e1ff" },
  { icon: "📘", count: "300K+", label: "Followers", color: "#e3f9ff", hoverColor: "#b8e8ff" },
  { icon: "📲", count: "2M+", label: "App Installs", color: "#e3f9e5", hoverColor: "#b8e8ba" },
  { icon: "👨‍⚕️", count: "40,000+", label: "Verified Doctors", color: "#fff4e3", hoverColor: "#ffe0b8" },
  { icon: "🎥", count: "3M+", label: "Subscribers", color: "#ffe3e3", hoverColor: "#ffb8b8" },
];


const About = () => {
  const [activeTab, setActiveTab] = useState("mission");
  const [hoveredStat, setHoveredStat] = useState(null);
  
  return (
    <div className="about-us-container">


      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Transforming Healthcare in <span className="highlight">Pakistan</span></h1>
        <p>
          CareConnect is revolutionizing healthcare access by connecting millions of patients 
          with trusted medical professionals through our innovative digital platform.
        </p>
        <motion.button 
          className="cta-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Our Mission
        </motion.button>
      </motion.div>
      <div className="tabs-container">
        <motion.button 
          className={`tab-button ${activeTab === "mission" ? "active" : ""}`}
          onClick={() => setActiveTab("mission")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Our Mission
        </motion.button>
        <motion.button 
          className={`tab-button ${activeTab === "vision" ? "active" : ""}`}
          onClick={() => setActiveTab("vision")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Our Vision
        </motion.button>
        <motion.button 
          className={`tab-button ${activeTab === "values" ? "active" : ""}`}
          onClick={() => setActiveTab("values")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Our Values
        </motion.button>
      </div>

      <motion.div 
        className="tab-content"
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "mission" && (
          <>
            <h2>Our Mission</h2>
            <p>
              To democratize healthcare access in Pakistan by leveraging technology to connect 
              patients with medical professionals, regardless of geographical or socioeconomic 
              barriers. We're committed to making quality healthcare affordable, accessible, 
              and convenient for every Pakistani.
            </p>
            <p>
              Through our platform, we've already facilitated millions of consultations, 
              but our work is far from done. We continue to innovate and expand our services 
              to reach underserved communities across the country.
            </p>
          </>
        )}
        
        {activeTab === "vision" && (
          <>
            <h2>Our Vision</h2>
            <p>
              We envision a Pakistan where no one has to choose between their health and 
              other basic needs. A future where telemedicine is the first point of contact 
              for healthcare, reducing pressure on hospitals and clinics while improving 
              health outcomes nationwide.
            </p>
            <p>
              By 2030, we aim to be the leading healthcare platform in South Asia, 
              serving 100 million patients annually with a network of 100,000+ verified 
              healthcare providers.
            </p>
          </>
        )}
        
        {activeTab === "values" && (
          <>
            <h2>Our Values</h2>
            <p>
              <strong>Patient First:</strong> Every decision we make begins with what's best for our patients.
            </p>
            <p>
              <strong>Integrity:</strong> We maintain the highest ethical standards in all our interactions.
            </p>
            <p>
              <strong>Innovation:</strong> We constantly push boundaries to solve healthcare challenges.
            </p>
            <p>
              <strong>Compassion:</strong> We treat every user with empathy and understanding.
            </p>
            <p>
              <strong>Excellence:</strong> We strive for the highest quality in everything we do.
            </p>
          </>
        )}
      </motion.div>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <motion.div 
            className="stat-box" 
            style={{ 
              background: hoveredStat === idx ? stat.hoverColor : stat.color 
            }}
            key={idx}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={() => setHoveredStat(idx)}
            onMouseLeave={() => setHoveredStat(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.count}</h3>
            <p>{stat.label}</p>
          </motion.div>
        ))}
      </div>

   
  

      <div className="testimonials">
        <h2>What People Say About Us</h2>
        <div className="testimonial-grid">
          <div className="testimonial">
            <p className="testimonial-text">
              "CareConnect saved my mother's life during lockdown when we couldn't find a doctor. 
              The video consultation was seamless and the prescription arrived immediately."
            </p>
            <div className="testimonial-author">
              <img src="img/fem.svg" alt="User" />
              <div className="author-info">
                <h4>Ayesha Malik</h4>
                <p>Patient from Lahore</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <p className="testimonial-text">
              "As a doctor, I appreciate how CareConnect has expanded my reach to patients 
              in remote areas while maintaining professional standards and fair compensation."
            </p>
            <div className="testimonial-author">
              <img src="img/male.svg" alt="User" />
              <div className="author-info">
                <h4>Dr. Haroon Ahmed</h4>
                <p>Cardiologist, Karachi</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <p className="testimonial-text">
              "The medication delivery service is a game-changer for my elderly parents. 
              Reliable, affordable, and saves us so much time and worry."
            </p>
            <div className="testimonial-author">
              <img src="img/fem.svg" alt="User" />
              <div className="author-info">
                <h4>Farah Nazir</h4>
                <p>Daughter of patients, Islamabad</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;