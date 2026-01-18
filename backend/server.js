require('dotenv').config();
console.log(`Server Code Here`);
// ===================== Add Task 5 code here ===================== 
// ===== Import Required Packages ===== 
const express = require("express");           // Web framework for Node.js
const cors = require("cors");                 // Middleware to enable CORS
const mysql = require("mysql2");              // MySQL client
const bodyParser = require("body-parser");    // Middleware to parse JSON bodies

const app = express();
const port = 3000;

// ===== Conversation Context Store (for maintaining chat history) ===== 
const conversationContexts = {}; // Store user conversations by userId

// ===== Middleware Setup ===== 
app.use(cors());
app.use(bodyParser.json());

// ===== MySQL Database Connection ===== 
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "doctor_appointment"
});


// ===================== Add Task 6 code here ===================== 
 // ===================== Get All Doctors Route ===================== 

app.get("/doctors", (req, res) => {
  // Get pagination and search parameters from query string
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;
  const offset = (page - 1) * limit;

  // Base SQL query to fetch doctors with joined specialties
  let baseSql = `
    SELECT 
      d.id, 
      d.name, 
      d.email, 
      d.bio, 
      d.image_url, 
      d.exp, 
      d.total_patients,
      d.online_fee, 
      d.visit_fee, 
      GROUP_CONCAT(s.name SEPARATOR ', ') AS specialties
    FROM doctors d
    JOIN doctor_specialties ds ON d.id = ds.doctor_id
    JOIN specialties s ON ds.specialty_id = s.id
  `;

  // Array to hold conditional clauses and values
  const conditions = [];
  const values = [];

  // If search query exists, filter by doctor name or specialty
  if (search) {
    conditions.push("(LOWER(d.name) LIKE ? OR LOWER(s.name) LIKE ?)");
    values.push(search, search);
  }

  // Add WHERE clause if conditions exist
  if (conditions.length) {
    baseSql += " WHERE " + conditions.join(" AND ");
  }

  // Add GROUP BY, LIMIT, and OFFSET clauses for pagination
  baseSql += " GROUP BY d.id LIMIT ? OFFSET ?";
  values.push(limit, offset);

  // Execute the query
  db.query(baseSql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===================== Get Single Doctor by ID ===================== 

app.get("/doctors/:id", (req, res) => {
  const doctorId = req.params.id; // Extract doctor ID from URL parameters

  // SQL query to fetch detailed doctor information
  const sql = `
    SELECT 
      d.id,
      d.name,
      d.email,
      d.bio,
      d.image_url,
      d.exp,
      d.total_patients,
      d.online_fee,
      d.visit_fee,

      -- Fetch specialties as a comma-separated string
      GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS specialties,

      -- Fetch associated clinic details as a JSON array
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'clinic_name', dc.clinic_name,
            'clinic_fee', dc.clinic_fee
          )
        )
        FROM doctor_clinic dc
        WHERE dc.doctor_id = d.id
      ) AS clinics,

      -- Fetch recent reviews with patient name and rating
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'rating', r.rating,
            'comment', r.comment,
            'patient_name', p.name,
            'daysAgo', DATEDIFF(CURDATE(), r.id)
          )
        )
        FROM reviews r
        JOIN patients p ON r.patient_id = p.id
        WHERE r.doctor_id = d.id
        ORDER BY r.id DESC
        LIMIT 5
      ) AS reviews,

      -- Fetch upcoming availability records
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'available_date', a.available_date,
            'start_time', a.start_time,
            'end_time', a.end_time
          )
        )
        FROM availability a
        WHERE a.doctor_id = d.id AND a.available_date >= CURDATE()
        ORDER BY a.available_date ASC
        LIMIT 5
      ) AS availability

    FROM doctors d
    LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
    LEFT JOIN specialties s ON ds.specialty_id = s.id
    WHERE d.id = ?
    GROUP BY d.id;
  `;

  // Execute the query
  db.query(sql, [doctorId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Server/database error
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Doctor not found" }); // No doctor with this ID
    }

    // Send the result (doctor details) as JSON response
    res.json(results[0]);
  });
}); 

// ===================== Add Task 7 code here ===================== 

// ===================== User Signup ===================== 
app.post("/signup", (req, res) => {
  const { username, password, dob, email } = req.body;

  const sql = `
    INSERT INTO patients (name, email, password, dob)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [username, email, password, dob], (err, result) => {
    if (err) {
      // Handle database errors like duplicate email or connection issue
      return res.status(500).json({ error: err.message });
    }

    // Respond with success message if insertion succeeds
    res.status(201).json({ message: "User registered successfully" });
  });
});

// ===================== User Login ===================== 
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // SQL query to find user by email and password
  const sql = `
    SELECT id FROM patients
    WHERE email = ? AND password = ?
  `;

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    // Check if exactly one matching user is found
    if (results.length === 1) {
      res.json({ success: true, userId: results[0].id });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

// ===================== Add Task 8 code here ===================== 
// ===================== Appointment Routes ===================== 

/**
 *  GET /appointments/user/:userId
 * Fetch all appointments for a specific user
 * - Accepts user ID as a route parameter
 * - Joins appointments with doctor details to return the doctor’s name
 * - Orders results by most recent appointment date and time
 */
 app.get("/appointments/user/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      a.id, 
      a.appointment_date, 
      a.start_time, 
      a.notes, 
      a.appointment_type,
      d.name AS doctor_name
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC, a.start_time ASC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/**
 * DELETE /appointments/:id
 * Delete a specific appointment by its ID
 * - Accepts appointment ID as a route parameter
 * - Executes a DELETE SQL query.
 */
app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM appointments WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment deleted successfully" });
  });
});

/**
 * POST /book-appointment
 * Book a new appointment.
 * - Extracts `patientId`, `doctorId`, `date`, `time`, and `reason` from `req.body`
 * - Inserts new appointment into the `appointments` table
 */
app.post("/book-appointment", (req, res) => {
  const { patientId, doctorId, date, time, reason, appointmentType } = req.body;

  // Basic validation
  if (!patientId || !doctorId || !date || !time || !reason) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Calculate end time as 1 hour after start time
  const [hours, minutes] = time.split(':').map(Number);
  const endHours = (hours + 1) % 24;
  const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  const query = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, appointment_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [patientId, doctorId, date, time + ':00', endTime, appointmentType || 'clinic', reason], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ 
      message: "Appointment booked successfully", 
      appointmentId: result.insertId 
    });
  });
});

// ===================== Add Task 10 code here ===================== 

// LangChain imports
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

// Initialize Chat model
const chatModel = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0
});

// ===================== Add Task 11 code here ===================== 
const {
  initializeVectorStore,
  getVectorStore
} = require('./chatbot-service'); // Adjust path if needed

const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;
  console.log("chat bot");

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Please enter a valid message about the project.' });
  }

  const trimmedMessage = message.trim();
  const lowerMessage = trimmedMessage.toLowerCase();
  
  // Initialize or get user conversation context
  const userContext = userId ? (conversationContexts[userId] || {}) : {};

  const greetingRegex = /^(hi|hello|hey|greetings|how are you|what's up)\b/i;
  if (greetingRegex.test(lowerMessage)) {
    return res.json({
      reply: `Hi, I'm your doctor appointment assistant. Feel free to ask me about doctors, their specialties, clinics, and appointments!`,
      context: [],
      source: "greeting"
    });
  }

  try {
    console.log(`📩 User question: "${message}"`);
    
    // Check if this is an affirmative response (yes, ok, sure, please, etc.)
    const affirmativeRegex = /^(yes|yeah|yep|ok|okay|sure|please|go ahead|let's do it|book it)\b/i;
    const isAffirmative = affirmativeRegex.test(lowerMessage);
    
    // Check if user is specifying booking details (date, time, appointment type)
    const dateRegex = /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})?/i;
    const appointmentTypeRegex = /(online|clinic|consultation|visit|in-person)/i;
    const dateMatch = trimmedMessage.match(dateRegex);
    const appointmentTypeMatch = trimmedMessage.match(appointmentTypeRegex);
    
    const isBookingRequest = dateMatch || (appointmentTypeMatch && userContext.lastDoctor);
    
    // If user is trying to book with date/time/appointment type
    if (isBookingRequest && userContext.lastDoctor) {
      const doctorInfo = userContext.lastDoctor;
      let bookingDate = 'Not specified';
      let appointmentType = 'clinic';
      
      if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = dateMatch[3] || new Date().getFullYear();
        bookingDate = `${month} ${day}, ${year}`;
      }
      
      if (appointmentTypeMatch) {
        const type = appointmentTypeMatch[1].toLowerCase();
        appointmentType = type.includes('online') || type.includes('consultation') ? 'online' : 'clinic';
      }
      
      const bookingSummary = `
Booking Request Summary:
Doctor: ${doctorInfo.name}
Date: ${bookingDate}
Appointment Type: ${appointmentType}
Fee: $${appointmentType === 'online' ? doctorInfo.online_fee : doctorInfo.visit_fee}

Location: ${appointmentType === 'clinic' ? (doctorInfo.clinics || 'City General Hospital') : 'Online'}
      `;
      
      // Store booking context for the next step
      if (userId) {
        conversationContexts[userId].lastBookingRequest = {
          doctorId: doctorInfo.id,
          doctorName: doctorInfo.name,
          appointmentDate: bookingDate,
          appointmentType: appointmentType,
          fee: appointmentType === 'online' ? doctorInfo.online_fee : doctorInfo.visit_fee
        };
      }
      
      const strictPrompt = ChatPromptTemplate.fromPromptMessages([
        { role: "system", content: `
You are a helpful AI assistant for a doctor appointment booking system.
The user wants to book an appointment with ${doctorInfo.name}.

Booking Details:
{bookingSummary}

Help them confirm the booking and ask for:
1. Preferred time (if not already specified)
2. Reason for appointment/notes
3. Confirm they want to proceed

Be friendly and helpful.
        ` },
        { role: "user", content: "{question}" }
      ]);

      const msgList = await strictPrompt.formatMessages({
        bookingSummary,
        question: trimmedMessage
      });

      const aiResponse = await chatModel.call(msgList);

      return res.json({
        reply: aiResponse.content || aiResponse.text || aiResponse,
        context: [bookingSummary],
        source: "booking",
        doctorContext: doctorInfo,
        bookingInfo: conversationContexts[userId]?.lastBookingRequest
      });
    }
    
    // If affirmative and we have previous doctor context, ask about booking details
    if (isAffirmative && userContext.lastDoctor) {
      const doctorInfo = userContext.lastDoctor;
      const context = `
Doctor Information:
Name: ${doctorInfo.name}
Specialties: ${doctorInfo.specialties || 'Not specified'}
Clinics: ${doctorInfo.clinics || 'Not specified'}
Experience: ${doctorInfo.exp} years
Total Patients: ${doctorInfo.total_patients}
Online Consultation Fee: $${doctorInfo.online_fee}
Clinic Visit Fee: $${doctorInfo.visit_fee}
Bio: ${doctorInfo.bio}

The user is interested in booking an appointment with this doctor.
      `;

      const strictPrompt = ChatPromptTemplate.fromPromptMessages([
        { role: "system", content: `
You are a helpful AI assistant for a doctor appointment booking system. 
The user has shown interest in ${doctorInfo.name}. 
Help them proceed with booking by asking about:
1. Preferred date and time
2. Appointment type (online consultation or clinic visit)
3. Reason for appointment

Doctor Context:
{context}

Be friendly and guide them through the booking process.
        ` },
        { role: "user", content: "{question}" }
      ]);

      const messages = await strictPrompt.formatMessages({
        context,
        question: trimmedMessage
      });

      const aiResponse = await chatModel.call(messages);

      return res.json({
        reply: aiResponse.content || aiResponse.text || aiResponse,
        context: [context],
        source: "database",
        doctorContext: doctorInfo
      });
    }
    
    // Check if question is about doctors/specialties/clinics
    const doctorKeywords = ['doctor', 'specialty', 'speciality', 'clinic', 'appointment', 'fee', 'experience'];
    const isDoctorQuestion = doctorKeywords.some(keyword => lowerMessage.includes(keyword));
    
    let dbContext = '';
    let dbResults = null;
    
    // If it's a doctor-related question, query the database
    if (isDoctorQuestion) {
      // Try to extract doctor name
      const nameMatch = trimmedMessage.match(/(?:doctor|dr\.?|what is the specialty of)\s+([A-Za-z]+\s+[A-Za-z]+)/i);
      
      if (nameMatch) {
        const doctorName = nameMatch[1].trim();
        console.log(`Looking for doctor: ${doctorName}`);
        
        const dbResult = await new Promise((resolve, reject) => {
          const query = `
            SELECT 
              d.id,
              d.name,
              d.bio,
              d.exp,
              d.total_patients,
              d.online_fee,
              d.visit_fee,
              GROUP_CONCAT(s.name SEPARATOR ', ') as specialties,
              GROUP_CONCAT(dc.clinic_name SEPARATOR ', ') as clinics
            FROM doctors d
            LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
            LEFT JOIN specialties s ON ds.specialty_id = s.id
            LEFT JOIN doctor_clinic dc ON d.id = dc.doctor_id
            WHERE d.name LIKE ?
            GROUP BY d.id
          `;
          
          db.query(query, [`%${doctorName}%`], (err, results) => {
            if (err) {
              console.error('DB Error:', err);
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
        
        if (dbResult && dbResult.length > 0) {
          dbResults = dbResult[0];
          dbContext = `
Doctor Information:
Name: ${dbResult[0].name}
Specialties: ${dbResult[0].specialties || 'Not specified'}
Clinics: ${dbResult[0].clinics || 'Not specified'}
Experience: ${dbResult[0].exp} years
Total Patients: ${dbResult[0].total_patients}
Online Consultation Fee: $${dbResult[0].online_fee}
Clinic Visit Fee: $${dbResult[0].visit_fee}
Bio: ${dbResult[0].bio}
          `;
          
          // Store doctor context for future affirmative responses
          if (userId) {
            conversationContexts[userId] = {
              lastDoctor: dbResult[0],
              timestamp: Date.now()
            };
          }
          
          console.log('DB Context:', dbContext);
        }
      } else {
        // Generic doctor query
        const dbResult = await new Promise((resolve, reject) => {
          const query = `
            SELECT 
              d.id,
              d.name,
              d.bio,
              GROUP_CONCAT(s.name SEPARATOR ', ') as specialties
            FROM doctors d
            LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
            LEFT JOIN specialties s ON ds.specialty_id = s.id
            GROUP BY d.id
            LIMIT 5
          `;
          
          db.query(query, (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
        
        if (dbResult && dbResult.length > 0) {
          dbContext = `Available Doctors: ${dbResult.map(d => `${d.name} (${d.specialties})`).join(', ')}`;
        }
      }
    }

    const vectorStore = getVectorStore();
    
    // Build the response context
    let context = '';
    if (dbContext) {
      context = dbContext;
    } else if (vectorStore) {
      const relevantDocs = await vectorStore.similaritySearch(trimmedMessage, 3);
      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => doc.pageContent).join('\n---\n');
      }
    }

    if (!context) {
      return res.json({
        reply: "I couldn't find information to answer your question. Try asking about specific doctors or general appointment information.",
        context: []
      });
    }

    const strictPrompt = ChatPromptTemplate.fromPromptMessages([
      { role: "system", content: `
You are a helpful AI assistant for a doctor appointment booking system. Answer questions based on the provided context about doctors, their specialties, clinics, fees, and availability.

Context:
{context}

Rules:
- Be friendly and helpful
- If the context has specific doctor information, provide details about specialties, clinics, and fees
- If you don't have specific information, suggest asking about a specific doctor
- Encourage users to book appointments
      ` },
      { role: "user", content: "{question}" }
    ]);

    const messages = await strictPrompt.formatMessages({
      context,
      question: trimmedMessage
    });

    const aiResponse = await chatModel.call(messages);

    console.log('Response:', aiResponse);

    res.json({
      reply: aiResponse.content || aiResponse.text || aiResponse,
      context: [context],
      source: isDoctorQuestion && dbResults ? "database" : "project",
      doctorContext: dbResults
    });

  } catch (error) {
    console.error('Error processing question:', error.message);
    res.status(500).json({
      error: 'Error processing your question',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===================== Add Task 12 code here ===================== 
// Start the server only after vector store is ready
async function startServer() {
  await initializeVectorStore();  // Load and embed project description
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Vector store ready for project description');
  });
}

// Kick off the async initialization + server start process
startServer();

// Export the app instance for use in tests or other modules
module.exports = app;

// === Task 5: Establish the database connection and error handling here === 

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});


// ===================== Task 5: Start the Server here ===================== 
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});