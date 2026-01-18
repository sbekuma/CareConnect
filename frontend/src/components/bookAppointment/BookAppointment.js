import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BookAppointment.css";
// ===================== Add task 24 imports here =====================


// Default time slots available for appointment booking
const defaultTimeSlots = [
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00"
];

export default function BookAppointment() {
  const { doctorId } = useParams(); // Get doctor ID from route parameter
  const navigate = useNavigate();   // Used for redirecting after booking

  // State variables
  const [formData, setFormData] = useState({ date: "", time: "", reason: "" }); // Form input values
  const [doctor, setDoctor] = useState(null);            // Fetched doctor details
  const [currentDate, setCurrentDate] = useState(new Date()); // Calendar month navigation
  const [bookedSlots, setBookedSlots] = useState([]);    // Already booked time slots for selected date
  const [statusMessage, setStatusMessage] = useState(""); // Message after booking attempt
  const [isSuccess, setIsSuccess] = useState(null);       // null = nothing, true = success, false = error

  // Fetch doctor details once on component mount
  useEffect(() => {
    axios.get(`http://localhost:3000/doctors/${doctorId}`)
      .then(res => setDoctor(res.data))
      .catch(err => console.error("Failed to fetch doctor:", err));
  }, [doctorId]);

  // Fetch booked time slots whenever selected date changes
  useEffect(() => {
    if (formData.date) {
      axios.get(`http://localhost:3000/appointments?doctorId=${doctorId}&date=${formData.date}`)
        .then(res => setBookedSlots(res.data.bookedTimes))
        .catch(err => console.error("Failed to fetch booked slots:", err));
    }
  }, [formData.date, doctorId]);

  // When user clicks a date on calendar
  const handleDateClick = (date) => {
    setFormData({ ...formData, date, time: "" }); // Reset selected time
  };

  // Handle input changes for all form fields
  const handleChange = (e) => {
    const updatedForm = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedForm);
  };

  // Navigate calendar month back/forward
  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Submit form to book appointment
  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    // Send appointment booking request
    axios.post("http://localhost:3000/book-appointment", {
      patientId: userId,
      doctorId,
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      appointmentType: "clinic"
    })
    .then(() => {
      // On success, show message and redirect to appointments page
      setStatusMessage(" Appointment booked successfully! Redirecting...");
      setIsSuccess(true);
      setTimeout(() => navigate("/appointments"), 2000);
    })
    .catch(err => {
      console.error("Booking failed", err);
      setStatusMessage(" Failed to book appointment. Please try again.");
      setIsSuccess(false);
    });
  };

  // Generate the calendar UI with days, handling past dates
  const generateCalendar = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const date = new Date(year, month, 1);
    const startDay = date.getDay(); // Index of first weekday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split("T")[0];

    // Header with month navigation and weekdays
    const header = (
      <>
        <div className="calendar-navigation">
          <button type="button" onClick={() => handleMonthChange(-1)}>&lt;</button>
          <div className="calendar-header">{monthName.toUpperCase()} {year}</div>
          <button type="button" onClick={() => handleMonthChange(1)}>&gt;</button>
        </div>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </>
    );

    // Empty slots for days before the 1st of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={"empty-" + i} className="calendar-day empty"></div>);
    }

    // Render calendar days
    for (let i = 1; i <= daysInMonth; i++) {
      const thisDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const isPast = thisDate < todayStr;

      days.push(
        <div
          key={i}
          className={`calendar-day${formData.date === thisDate ? " selected" : ""}${isPast ? " disabled" : ""}`}
          onClick={() => !isPast && handleDateClick(thisDate)}
        >
          {i}
        </div>
      );
    }

    return <>{header}{days}</>;
  };

  // Show loading state until doctor data is fetched
  if (!doctor) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
        <p>Loading doctor information...</p>
      </div>
    );
  }
  

  return (
    <div className="appointment-container">
      <h1 className="appointment-title">Book an Appointment</h1>

      {/* Doctor profile information */}
      <div className="doctor-info">
        <div className="doctor-profile">
          <img src={doctor.image_url} alt={doctor.name} className="doctor-photo" />
          <div className="doctor-details">
            <h2 className="doctor-name">Dr. {doctor.name}</h2>
            <p className="doctor-specialty">{doctor.specialties}</p>
            <p className="doctor-experience">{doctor.exp} years of experience</p>
          </div>
        </div>
      </div>

      {/* Booking status message */}
      {statusMessage && (
        <div className={`message-box ${isSuccess ? "success" : "error"}`}>
          {statusMessage}
        </div>
      )}

      {/* Appointment form */}
      <form onSubmit={handleSubmit} className="appointment-form">
        <label>Select Date</label>
        <div className="calendar-container">{generateCalendar()}</div>

        {/* Show time slots only after a date is selected */}
        {formData.date && (
          <>
            <label>Available Time Slots</label>
            <select name="time" value={formData.time} onChange={handleChange} required>
              <option value="">Select a time</option>
              {defaultTimeSlots.map((slot) => (
                <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                  {slot} {bookedSlots.includes(slot) ? "(Booked)" : ""}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Reason input */}
        <label>Reason for Visit</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Describe your symptoms"
          required
        ></textarea>

        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
}