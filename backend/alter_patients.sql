-- Add missing dob column to patients table
ALTER TABLE doctor_appointment.patients ADD COLUMN dob DATE;
