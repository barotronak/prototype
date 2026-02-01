import { z } from 'zod'

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'DOCTOR', 'LABORATORY', 'PHARMACY', 'PATIENT']),
  phone: z.string().optional(),
})

// ==================== DOCTOR SCHEMAS ====================

export const doctorProfileSchema = z.object({
  specialization: z.string().min(1, 'Specialization is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  consultationFee: z.number().min(0, 'Consultation fee must be positive'),
  bio: z.string().optional(),
})

export const doctorAvailabilitySchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)'),
  slotDuration: z.number().min(5).max(120, 'Slot duration must be between 5-120 minutes'),
  isActive: z.boolean().default(true).optional(),
})

// ==================== LABORATORY SCHEMAS ====================

export const laboratoryProfileSchema = z.object({
  labName: z.string().min(1, 'Lab name is required'),
  address: z.string().min(1, 'Address is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  servicesOffered: z.string().min(1, 'Services offered is required'),
  operatingHours: z.string().optional(),
})

// ==================== PHARMACY SCHEMAS ====================

export const pharmacyProfileSchema = z.object({
  pharmacyName: z.string().min(1, 'Pharmacy name is required'),
  address: z.string().min(1, 'Address is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  operatingHours: z.string().optional(),
})

// ==================== PATIENT SCHEMAS ====================

export const patientProfileSchema = z.object({
  dateOfBirth: z.string().or(z.date()),
  gender: z.string().min(1, 'Gender is required'),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
})

// ==================== APPOINTMENT SCHEMAS ====================

export const appointmentSchema = z.object({
  doctorId: z.string().cuid('Invalid doctor ID'),
  patientId: z.string().cuid('Invalid patient ID'),
  appointmentDate: z.string().or(z.date()),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export const updateAppointmentSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
})

// ==================== PRESCRIPTION SCHEMAS ====================

export const labPrescriptionSchema = z.object({
  doctorId: z.string().cuid('Invalid doctor ID'),
  patientId: z.string().cuid('Invalid patient ID'),
  labId: z.string().cuid('Invalid lab ID'),
  testName: z.string().min(1, 'Test name is required'),
  testDetails: z.string().optional(),
  instructions: z.string().optional(),
  urgency: z.enum(['ROUTINE', 'URGENT', 'STAT']).optional(),
  prescriptionPdfUrl: z.string().optional(),
})

export const medicinePrescriptionSchema = z.object({
  doctorId: z.string().cuid('Invalid doctor ID'),
  patientId: z.string().cuid('Invalid patient ID'),
  pharmacyId: z.string().cuid('Invalid pharmacy ID'),
  medicines: z.array(
    z.object({
      name: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
      duration: z.string().min(1, 'Duration is required'),
    })
  ).min(1, 'At least one medicine is required'),
  instructions: z.string().optional(),
  prescriptionPdfUrl: z.string().optional(),
})

export const updatePrescriptionSchema = z.object({
  status: z.enum(['PENDING', 'FULFILLED', 'CANCELLED']),
})

// ==================== LAB REPORT SCHEMAS ====================

export const labReportSchema = z.object({
  labPrescriptionId: z.string().cuid('Invalid prescription ID'),
  labId: z.string().cuid('Invalid lab ID'),
  patientId: z.string().cuid('Invalid patient ID'),
  reportPdfUrl: z.string().optional(),
  structuredData: z.any().optional(), // JSON data
  findings: z.string().optional(),
  recommendations: z.string().optional(),
})

// ==================== VITAL RECORD SCHEMAS ====================

export const vitalRecordSchema = z.object({
  patientId: z.string().cuid('Invalid patient ID'),
  admissionId: z.string().cuid('Invalid admission ID').optional(),
  bloodPressureSystolic: z.number().min(0).max(300).optional(),
  bloodPressureDiastolic: z.number().min(0).max(200).optional(),
  temperature: z.number().min(90).max(110).optional(),
  pulse: z.number().min(0).max(300).optional(),
  spo2: z.number().min(0).max(100).optional(),
  bloodSugar: z.number().min(0).max(500).optional(),
  weight: z.number().min(0).max(500).optional(),
  height: z.number().min(0).max(300).optional(),
  bmi: z.number().min(0).max(100).optional(),
  heartRateData: z.any().optional(), // JSON data
  notes: z.string().optional(),
  recordedBy: z.string().optional(),
})

// ==================== PATIENT ADMISSION SCHEMAS ====================

export const admissionSchema = z.object({
  patientId: z.string().cuid('Invalid patient ID'),
  doctorId: z.string().cuid('Invalid doctor ID'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  symptoms: z.string().optional(),
  ward: z.string().optional(),
  bedNumber: z.string().optional(),
  isIcu: z.boolean().default(false),
  treatmentPlan: z.string().optional(),
})

export const updateAdmissionSchema = z.object({
  status: z.enum(['ADMITTED', 'DISCHARGED', 'TRANSFERRED']).optional(),
  dischargeDate: z.string().or(z.date()).optional(),
  dischargeSummary: z.string().optional(),
  treatmentPlan: z.string().optional(),
})

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type DoctorProfileInput = z.infer<typeof doctorProfileSchema>
export type LaboratoryProfileInput = z.infer<typeof laboratoryProfileSchema>
export type PharmacyProfileInput = z.infer<typeof pharmacyProfileSchema>
export type PatientProfileInput = z.infer<typeof patientProfileSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type LabPrescriptionInput = z.infer<typeof labPrescriptionSchema>
export type MedicinePrescriptionInput = z.infer<typeof medicinePrescriptionSchema>
export type LabReportInput = z.infer<typeof labReportSchema>
export type VitalRecordInput = z.infer<typeof vitalRecordSchema>
export type AdmissionInput = z.infer<typeof admissionSchema>
export type PatientAdmissionInput = AdmissionInput // Alias for backward compatibility
