import React, { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Github } from "lucide-react";
import "./About.css"

const stats = [
  { icon: "📍", count: "4+", label: "States & Districts", color: "#e3f5ff", hoverColor: "#b8e1ff" },
  { icon: "👥", count: "500K+", label: "Active Users", color: "#e3f9ff", hoverColor: "#b8e8ff" },
  { icon: "📲", count: "1M+", label: "App Installs", color: "#e3f9e5", hoverColor: "#b8e8ba" },
  { icon: "👨‍⚕️", count: "15,000+", label: "Board-Certified Doctors", color: "#fff4e3", hoverColor: "#ffe0b8" },
  { icon: "📈", count: "2M+", label: "Successful Consultations", color: "#ffe3e3", hoverColor: "#ffb8b8" },
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
        <h1>Transforming Healthcare in the <span className="highlight">United States</span></h1>
        <p>
          CareConnect is a US-based digital health pioneer, revolutionizing access to medical expertise across 
          Maryland, Virginia, DC, and New York through our innovative appointment and consultation platform.
        </p>
        <motion.button 
          className="cta-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Our Mission
        </motion.button>
      </motion.div>

      {/* Developer Section */}
      <section className="developer-section">
        <motion.div 
          className="dev-card"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="dev-content">
            <div className="dev-info">
              <span className="dev-badge">Lead Developer</span>
              <h2>Sami Bekuma</h2>
              <p>Passionate Machine Learning and Full Stack Developer dedicated to building accessible healthcare solutions for the community.</p>
              
              <div className="dev-socials">
                <a href="https://www.linkedin.com/in/samibekuma" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                  <Linkedin size={20} />
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com/sbekuma/CareConnect.git" target="_blank" rel="noopener noreferrer" className="social-link github">
                  <Github size={20} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            <div className="dev-visual">
              <div className="dev-avatar-container">
                {/* Fixed image path to reference your local file in public folder */}
                <img 
                  src="/img/profile.jpg" 
                  alt="Lead Developer" 
                  className="dev-avatar" 
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('fallback-avatar');
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

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
              To democratize healthcare access across the East Coast by leveraging advanced technology to connect 
              patients with top-tier medical professionals. We are currently focused on serving communities in 
              Maryland, Virginia, DC, and New York, ensuring quality care is affordable and convenient.
            </p>
            <p>
              Through our platform, we eliminate the physical and logistical barriers that often stand between 
              patients and the care they deserve. We continue to innovate our services to reach every neighborhood, 
              from urban centers to suburban communities.
            </p>
          </>
        )}
        
        {activeTab === "vision" && (
          <>
            <h2>Our Vision</h2>
            <p>
              We envision a future where high-quality healthcare is just a click away for every resident in our 
              service areas. By optimizing the connection between doctors and patients, we aim to reduce 
              wait times and improve overall health outcomes throughout the Tri-State and Mid-Atlantic regions.
            </p>
            <p>
              By 2030, we aim to be the premier healthcare platform in the United States, 
              facilitating millions of annual consultations through an elite network of 100,000+ 
              verified healthcare providers.
            </p>
          </>
        )}
        
        {activeTab === "values" && (
          <>
            <h2>Our Values</h2>
            <p>
              <strong>Patient First:</strong> Every architectural choice in our platform begins with user safety and ease of access.
            </p>
            <p>
              <strong>Integrity:</strong> We strictly adhere to HIPAA standards and the highest ethical benchmarks in medical data management.
            </p>
            <p>
              <strong>Innovation:</strong> We utilize cutting-edge AI and cloud technology to solve complex healthcare scheduling and delivery challenges.
            </p>
            <p>
              <strong>Compassion:</strong> We treat every user interaction with the empathy and respect it deserves.
            </p>
            <p>
              <strong>Excellence:</strong> We strive for 100% platform reliability and medical provider quality.
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
              "CareConnect made it incredibly easy to find a specialist in Baltimore. 
              The video consultation was crystal clear and I was able to get my prescription 
              sent to my local pharmacy within minutes."
            </p>
            <div className="testimonial-author">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" />
              <div className="author-info">
                <h4>Sarah Jenkins</h4>
                <p>Patient from Baltimore, MD</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <p className="testimonial-text">
              "As a provider in New York, I've seen how this platform streamlines my 
              availability and allows me to focus more on patient care rather than 
              administrative scheduling hurdles."
            </p>
            <div className="testimonial-author">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="User" />
              <div className="author-info">
                <h4>Dr. Michael Chen</h4>
                <p>Cardiologist, New York, NY</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial">
            <p className="testimonial-text">
              "Living in Arlington, the traffic can make simple clinic visits a 2-hour ordeal. 
              Using CareConnect for my routine check-ups has saved me so much time 
              without sacrificing the quality of care."
            </p>
            <div className="testimonial-author">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" alt="User" />
              <div className="author-info">
                <h4>David Thompson</h4>
                <p>Patient from Arlington, VA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
