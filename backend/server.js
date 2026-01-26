const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

// LangChain & Gemini Imports
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');

const app = express();
// CRITICAL: Use process.env.PORT for Render deployment
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Global variable to store chat history (Prevents ReferenceError)
const conversationContexts = {};

// MySQL Database Connection
// CRITICAL: SSL is REQUIRED for Aiven MySQL cloud connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "doctor_appointment",
  port: process.env.DB_PORT || 28841,
  ssl: { rejectUnauthorized: false } 
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database via Aiven Cloud.");
});

// Helper function to query database using promises
const queryDB = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// --- Initialize Chat Model ---
// Note: Ensure your .env has a valid GEMINI_API_KEY
const chatModel = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-preview-09-2025', 
    apiKey: process.env.GEMINI_API_KEY || "", 
    temperature: 0.1 
});

// ===================== Root Route ===================== 
// This fixes the "Cannot GET /" error on the main Render URL
app.get("/", (req, res) => {
  res.send("CareConnect Backend API is running successfully!");
});

// ===================== Doctor Routes ===================== 

app.get("/doctors", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;
  const offset = (page - 1) * limit;

  let baseSql = `
    SELECT 
      d.id, d.name, d.email, d.bio, d.image_url, d.exp, d.total_patients,
      d.online_fee, d.visit_fee, GROUP_CONCAT(s.name SEPARATOR ', ') AS specialties
    FROM doctors d
    LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
    LEFT JOIN specialties s ON ds.specialty_id = s.id
  `;

  const values = [];
  if (search) {
    baseSql += " WHERE (LOWER(d.name) LIKE ? OR LOWER(s.name) LIKE ?)";
    values.push(search, search);
  }

  baseSql += " GROUP BY d.id LIMIT ? OFFSET ?";
  values.push(limit, offset);

  db.query(baseSql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/doctors/:id", (req, res) => {
  const doctorId = req.params.id;
  const sql = `
    SELECT d.*, GROUP_CONCAT(s.name) as specialties 
    FROM doctors d
    LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
    LEFT JOIN specialties s ON ds.specialty_id = s.id
    WHERE d.id = ?
    GROUP BY d.id
  `;
  db.query(sql, [doctorId], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Doctor not found" });
    res.json(results[0]);
  });
});

// ===================== Chatbot Endpoint ===================== 

app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Please enter a valid message.' });
  }

  if (userId && !conversationContexts[userId]) {
    conversationContexts[userId] = { history: [] };
  }
  const userContext = userId ? conversationContexts[userId] : { history: [] };

  try {
    const lowerMsg = message.toLowerCase();
    const isAppointmentQuery = ['my', 'upcoming', 'appointment', 'booked', 'scheduled', 'when', 'reschedule', 'change'].some(k => lowerMsg.includes(k));

    let dbContext = "No specific database data available.";

    // Grounding: Fetch user's upcoming appointments for context
    if (isAppointmentQuery && userId) {
      try {
        const userAppointments = await queryDB(`
          SELECT a.id, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointment_date, a.start_time, d.name as doctor_name, a.appointment_type
          FROM appointments a
          JOIN doctors d ON a.doctor_id = d.id
          WHERE a.patient_id = ? AND a.appointment_date >= CURDATE()
          ORDER BY a.appointment_date ASC, a.start_time ASC
        `, [userId]);

        if (userAppointments.length > 0) {
          dbContext = `The user has the following upcoming appointments: ${JSON.stringify(userAppointments)}.`;
          console.log(`[Grounding] Appointments found for User ${userId}:`, dbContext);
        } else {
          dbContext = "The user has no upcoming appointments.";
        }
      } catch (dbErr) {
        console.error("Grounding Error:", dbErr);
      }
    }

    const historyMessages = userContext.history.slice(-6).map(msg => 
      [msg.role === "user" ? "human" : "ai", msg.text]
    );

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are the CareConnect AI Assistant.
       
       STRICT RULES ON IDs:
       - You MUST use the exact 'id' field provided in the JSON context for appointments.
       - NEVER invent or guess an ID number. If you don't see an ID in the context, ask the user to clarify.
       
       ACTION RULES:
       - If the user wants to reschedule, you MUST include this tag: [[ACTION:RESCHEDULE id=ID date="YYYY-MM-DD" time="HH:MM:SS"]]
       - Ensure the date is formatted as YYYY-MM-DD and time is 24-hour (HH:MM:SS).
       
       Database Context: {context}`],
      ...historyMessages,
      ["human", "{input}"]
    ]);

    const chain = prompt.pipe(chatModel);
    
    console.log("--- Sending request to Google Gemini ---");
    const aiResponse = await chain.invoke({
      context: dbContext,
      input: message
    });
    console.log("--- Received response from Google Gemini ---");

    let finalReply = aiResponse.content;

    // 2. INTERCEPT ACTION TAGS AND EXECUTE DATABASE UPDATES
    const actionRegex = /\[\[ACTION:RESCHEDULE id=(\d+) date="([^"]+)" time="([^"]+)"\]\]/;
    const match = finalReply.match(actionRegex);

    if (match) {
      const [fullTag, appId, newDate, newTime] = match;
      console.log(`\n--- Intercepted Action ---`);
      console.log(`Target Appointment ID: ${appId}`);
      console.log(`New Schedule: ${newDate} at ${newTime}`);
      console.log(`Authenticated User: ${userId}`);

      try {
        const timeParts = newTime.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1] || "0");
        const newEndTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

        const updateResult = await queryDB(`
          UPDATE appointments 
          SET appointment_date = ?, start_time = ?, end_time = ?
          WHERE id = ? AND patient_id = ?
        `, [newDate, newTime, newEndTime, appId, userId]);

        console.log(`SQL Result -> affectedRows: ${updateResult.affectedRows}`);

        if (updateResult.affectedRows > 0) {
          finalReply = finalReply.replace(fullTag, "").trim();
          finalReply += "\n\n✅ I have successfully updated your appointment in our database.";
        } else {
          console.warn(`[Fail] No row matched ID ${appId} for User ${userId}.`);
          finalReply = finalReply.replace(fullTag, "").trim();
          finalReply += "\n\n⚠️ I tried to reschedule, but I couldn't find that specific appointment ID in your records. Could you please double-check the appointment details?";
        }
      } catch (updateErr) {
        console.error("Database Update Error:", updateErr);
        finalReply = "I attempted to reschedule your appointment, but encountered a database error. Please try again.";
      }
    }

    userContext.history.push({ role: "user", text: message });
    userContext.history.push({ role: "bot", text: finalReply });

    res.json({ reply: finalReply });

  } catch (error) {
    console.error('CHATBOT ERROR:', error.message);
    res.status(500).json({ error: 'The AI service is currently taking too long or is unavailable. Please verify your API key and connection.' });
  }
});

// ===================== Auth Routes ===================== 

app.post("/signup", (req, res) => {
  const { username, email, password, dob } = req.body;
  const sql = "INSERT INTO patients (name, email, password, dob) VALUES (?, ?, ?, ?)";
  db.query(sql, [username, email, password, dob], (err, result) => {
    if (err) {
      console.error("Signup error:", err.sqlMessage || err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ success: true, userId: result.insertId });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT id FROM patients WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 1) {
      res.json({ success: true, userId: results[0].id });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// ===================== Appointment Routes ===================== 

app.post("/appointments", (req, res) => {
  const { user_id, doctor_id, patient_name, patient_phone, patient_age, patient_gender, appointment_date, appointment_time, appointment_type } = req.body;
  
  if (!user_id || !doctor_id || !appointment_time) {
    return res.status(400).json({ error: "Missing required booking fields" });
  }

  // FIX: Lowercase the type to match MySQL ENUM('online', 'clinic')
  const formattedType = (appointment_type || 'clinic').toLowerCase();

  let endTime = "00:00:00";
  try {
    const [hours, minutes] = appointment_time.split(':').map(Number);
    endTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`;
  } catch (e) { 
    console.error("Time calculation error", e); 
  }

  // Include Age and Gender in the notes field
  const notes = `Name: ${patient_name}, Phone: ${patient_phone}, Age: ${patient_age}, Gender: ${patient_gender}`;

  const sql = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, appointment_type, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [user_id, doctor_id, appointment_date, appointment_time, endTime, formattedType, notes], (err, result) => {
    if (err) {
      console.error("SQL Error during booking:", err.sqlMessage || err.message);
      // If error is code 'ER_NO_REFERENCED_ROW_2', it means the userId doesn't exist in Aiven
      return res.status(500).json({ error: err.message, sqlMessage: err.sqlMessage });
    }
    res.status(201).json({ message: "Appointment confirmed!", appointmentId: result.insertId });
  });
});

app.get("/appointments/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT 
      a.id, a.appointment_date, a.start_time, a.notes, a.appointment_type, 
      a.doctor_id, d.name AS doctor_name, d.image_url AS doctor_image
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running and listening on port ${port}`);
});