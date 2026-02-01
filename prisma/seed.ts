import prisma from '../lib/prisma'
import { hashPassword } from '../lib/auth'

async function main() {
  console.log('Starting seed...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.vitalRecord.deleteMany()
  await prisma.patientAdmission.deleteMany()
  await prisma.labReport.deleteMany()
  await prisma.medicinePrescription.deleteMany()
  await prisma.labPrescription.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.doctorAvailability.deleteMany()
  await prisma.doctorPharmacyPartnership.deleteMany()
  await prisma.doctorLabPartnership.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.pharmacy.deleteMany()
  await prisma.laboratory.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleaned existing data')

  // Create Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@healthcare.com',
      password: await hashPassword('admin123'),
      name: 'System Administrator',
      phone: '+1234567890',
      role: 'ADMIN',
    },
  })

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
    },
  })

  console.log('Created admin user')

  // Create Doctors
  const doctors = []
  const doctorData = [
    {
      email: 'dr.smith@healthcare.com',
      name: 'Dr. John Smith',
      phone: '+1234567891',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      experience: 15,
      consultationFee: 150.00,
      bio: 'Experienced cardiologist specializing in heart disease prevention and treatment',
      licenseNumber: 'DOC-CARD-001',
    },
    {
      email: 'dr.johnson@healthcare.com',
      name: 'Dr. Emily Johnson',
      phone: '+1234567892',
      specialization: 'Pediatrics',
      qualification: 'MBBS, MD (Pediatrics)',
      experience: 12,
      consultationFee: 120.00,
      bio: 'Dedicated pediatrician providing comprehensive care for children',
      licenseNumber: 'DOC-PED-002',
    },
    {
      email: 'dr.williams@healthcare.com',
      name: 'Dr. Michael Williams',
      phone: '+1234567893',
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics)',
      experience: 18,
      consultationFee: 180.00,
      bio: 'Orthopedic surgeon specializing in joint replacement and sports injuries',
      licenseNumber: 'DOC-ORTH-003',
    },
    {
      email: 'dr.brown@healthcare.com',
      name: 'Dr. Sarah Brown',
      phone: '+1234567894',
      specialization: 'General Medicine',
      qualification: 'MBBS, MD',
      experience: 10,
      consultationFee: 100.00,
      bio: 'General physician providing primary care and health consultations',
      licenseNumber: 'DOC-GEN-004',
    },
  ]

  for (const data of doctorData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: await hashPassword('doctor123'),
        name: data.name,
        phone: data.phone,
        role: 'DOCTOR',
      },
    })

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        qualification: data.qualification,
        experience: data.experience,
        consultationFee: data.consultationFee,
        bio: data.bio,
      },
    })

    doctors.push(doctor)
  }

  console.log('Created doctors')

  // Create Laboratories
  const laboratories = []
  const labData = [
    {
      email: 'contact@citylab.com',
      name: 'City Diagnostic Laboratory',
      phone: '+1234567895',
      labName: 'City Diagnostic Laboratory',
      address: '123 Main Street, City Center, State 12345',
      licenseNumber: 'LAB-001',
      servicesOffered: 'Blood Tests, Urine Tests, X-Ray, CT Scan, MRI, Ultrasound',
      operatingHours: 'Mon-Sat: 8 AM - 8 PM, Sun: 9 AM - 5 PM',
    },
    {
      email: 'info@healthlab.com',
      name: 'Health Plus Laboratory',
      phone: '+1234567896',
      labName: 'Health Plus Laboratory',
      address: '456 Oak Avenue, Medical District, State 12346',
      licenseNumber: 'LAB-002',
      servicesOffered: 'Blood Tests, Pathology, ECG, Echo, Stress Test',
      operatingHours: 'Mon-Sat: 7 AM - 9 PM, Sun: 8 AM - 6 PM',
    },
    {
      email: 'support@advancedlab.com',
      name: 'Advanced Diagnostics',
      phone: '+1234567897',
      labName: 'Advanced Diagnostics',
      address: '789 Health Boulevard, Medical Park, State 12347',
      licenseNumber: 'LAB-003',
      servicesOffered: 'Advanced Imaging, Molecular Diagnostics, Genetic Testing',
      operatingHours: 'Mon-Fri: 8 AM - 6 PM, Sat: 9 AM - 4 PM',
    },
  ]

  for (const data of labData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: await hashPassword('lab123'),
        name: data.name,
        phone: data.phone,
        role: 'LABORATORY',
      },
    })

    const lab = await prisma.laboratory.create({
      data: {
        userId: user.id,
        labName: data.labName,
        address: data.address,
        licenseNumber: data.licenseNumber,
        servicesOffered: data.servicesOffered.split(', '),
        operatingHours: data.operatingHours,
      },
    })

    laboratories.push(lab)
  }

  console.log('Created laboratories')

  // Create Pharmacies
  const pharmacies = []
  const pharmacyData = [
    {
      email: 'contact@citypharmacy.com',
      name: 'City Pharmacy',
      phone: '+1234567898',
      pharmacyName: 'City Pharmacy',
      address: '321 Main Street, Downtown, State 12348',
      licenseNumber: 'PHARM-001',
      operatingHours: 'Mon-Sat: 8 AM - 10 PM, Sun: 9 AM - 9 PM',
    },
    {
      email: 'info@healthmart.com',
      name: 'HealthMart Pharmacy',
      phone: '+1234567899',
      pharmacyName: 'HealthMart Pharmacy',
      address: '654 Health Street, Medical Zone, State 12349',
      licenseNumber: 'PHARM-002',
      operatingHours: 'Mon-Sun: 24 Hours',
    },
    {
      email: 'support@wellnesspharm.com',
      name: 'Wellness Pharmacy',
      phone: '+1234567800',
      pharmacyName: 'Wellness Pharmacy',
      address: '987 Wellness Road, Health District, State 12350',
      licenseNumber: 'PHARM-003',
      operatingHours: 'Mon-Sat: 7 AM - 11 PM, Sun: 8 AM - 10 PM',
    },
  ]

  for (const data of pharmacyData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: await hashPassword('pharmacy123'),
        name: data.name,
        phone: data.phone,
        role: 'PHARMACY',
      },
    })

    const pharmacy = await prisma.pharmacy.create({
      data: {
        userId: user.id,
        pharmacyName: data.pharmacyName,
        address: data.address,
        licenseNumber: data.licenseNumber,
        operatingHours: data.operatingHours,
      },
    })

    pharmacies.push(pharmacy)
  }

  console.log('Created pharmacies')

  // Create Patients
  const patients = []
  const patientData = [
    {
      email: 'john.doe@email.com',
      name: 'John Doe',
      phone: '+1234567801',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'MALE',
      address: '111 Patient Lane, Residential Area, State 12351',
      emergencyContact: '+1234567802',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      medicalHistory: 'Hypertension, controlled with medication',
    },
    {
      email: 'jane.smith@email.com',
      name: 'Jane Smith',
      phone: '+1234567803',
      dateOfBirth: new Date('1990-08-22'),
      gender: 'FEMALE',
      address: '222 Patient Street, Residential Zone, State 12352',
      emergencyContact: '+1234567804',
      bloodGroup: 'A+',
      allergies: 'None',
      medicalHistory: 'Diabetes Type 2, on insulin therapy',
    },
    {
      email: 'bob.wilson@email.com',
      name: 'Bob Wilson',
      phone: '+1234567805',
      dateOfBirth: new Date('1978-03-10'),
      gender: 'MALE',
      address: '333 Health Avenue, Living District, State 12353',
      emergencyContact: '+1234567806',
      bloodGroup: 'B+',
      allergies: 'Sulfa drugs',
      medicalHistory: 'Asthma, uses inhaler as needed',
    },
    {
      email: 'alice.brown@email.com',
      name: 'Alice Brown',
      phone: '+1234567807',
      dateOfBirth: new Date('1995-12-05'),
      gender: 'FEMALE',
      address: '444 Care Road, Community Area, State 12354',
      emergencyContact: '+1234567808',
      bloodGroup: 'AB+',
      allergies: 'Latex',
      medicalHistory: 'No significant medical history',
    },
  ]

  for (const data of patientData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: await hashPassword('patient123'),
        name: data.name,
        phone: data.phone,
        role: 'PATIENT',
      },
    })

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        emergencyContact: data.emergencyContact,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies ? data.allergies.split(', ') : [],
      },
    })

    patients.push(patient)
  }

  console.log('Created patients')

  // Create Doctor Partnerships
  for (const doctor of doctors) {
    // Partner with 2 labs
    await prisma.doctorLabPartnership.create({
      data: {
        doctorId: doctor.id,
        labId: laboratories[0].id,
      },
    })
    await prisma.doctorLabPartnership.create({
      data: {
        doctorId: doctor.id,
        labId: laboratories[1].id,
      },
    })

    // Partner with 2 pharmacies
    await prisma.doctorPharmacyPartnership.create({
      data: {
        doctorId: doctor.id,
        pharmacyId: pharmacies[0].id,
      },
    })
    await prisma.doctorPharmacyPartnership.create({
      data: {
        doctorId: doctor.id,
        pharmacyId: pharmacies[1].id,
      },
    })
  }

  console.log('Created doctor partnerships')

  // Create Doctor Availability (Mon-Fri, 9 AM - 5 PM, 30-min slots)
  // dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  const daysOfWeek = [1, 2, 3, 4, 5] // Monday to Friday

  for (const doctor of doctors) {
    for (const day of daysOfWeek) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
        },
      })
    }
  }

  console.log('Created doctor availability')

  // Create sample appointments
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  await prisma.appointment.create({
    data: {
      doctorId: doctors[0].id,
      patientId: patients[0].id,
      appointmentDate: tomorrow,
      startTime: '10:00',
      endTime: '10:30',
      reason: 'Regular checkup and blood pressure monitoring',
      status: 'SCHEDULED',
    },
  })

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 0, 0, 0)

  await prisma.appointment.create({
    data: {
      doctorId: doctors[1].id,
      patientId: patients[1].id,
      appointmentDate: nextWeek,
      startTime: '14:00',
      endTime: '14:30',
      reason: 'Follow-up for diabetes management',
      status: 'SCHEDULED',
    },
  })

  console.log('Created sample appointments')

  // Create sample lab prescription
  const labPrescription = await prisma.labPrescription.create({
    data: {
      doctorId: doctors[0].id,
      patientId: patients[0].id,
      labId: laboratories[0].id,
      testName: 'Complete Blood Count (CBC)',
      testDetails: 'Comprehensive blood analysis including RBC, WBC, Platelets',
      instructions: 'Fasting required - 8-12 hours before test',
      urgency: 'ROUTINE',
      status: 'PENDING',
    },
  })

  console.log('Created sample lab prescription')

  // Create sample medicine prescription
  await prisma.medicinePrescription.create({
    data: {
      doctorId: doctors[1].id,
      patientId: patients[1].id,
      pharmacyId: pharmacies[0].id,
      medicines: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
        },
        {
          name: 'Insulin Glargine',
          dosage: '10 units',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
        },
      ],
      notes: 'Take medications with meals. Monitor blood sugar regularly.',
      status: 'PENDING',
    },
  })

  console.log('Created sample medicine prescription')

  // Create sample vital records
  await prisma.vitalRecord.create({
    data: {
      patientId: patients[0].id,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      temperature: 98.6,
      pulse: 72,
      spo2: 98,
      bloodSugar: 95,
      weight: 75.5,
      height: 175,
      bmi: 24.7,
    },
  })

  await prisma.vitalRecord.create({
    data: {
      patientId: patients[1].id,
      bloodPressureSystolic: 130,
      bloodPressureDiastolic: 85,
      temperature: 98.4,
      pulse: 78,
      spo2: 97,
      bloodSugar: 140,
      weight: 68.0,
      height: 165,
      bmi: 25.0,
    },
  })

  console.log('Created sample vital records')

  // Create sample admission
  const admission = await prisma.patientAdmission.create({
    data: {
      doctorId: doctors[0].id,
      patientId: patients[2].id,
      primaryDiagnosis: 'Acute Respiratory Infection',
      secondaryDiagnoses: [],
      symptoms: 'Fever, cough, difficulty breathing',
      wardNumber: 'General Ward',
      bedNumber: 'A-101',
      isIcuAdmission: false,
      treatmentPlan: 'IV antibiotics, oxygen therapy, rest',
      status: 'ADMITTED',
    },
  })

  // Add vital records for admitted patient
  await prisma.vitalRecord.create({
    data: {
      patientId: patients[2].id,
      bloodPressureSystolic: 125,
      bloodPressureDiastolic: 82,
      temperature: 101.5,
      pulse: 88,
      spo2: 94,
    },
  })

  console.log('Created sample admission')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
