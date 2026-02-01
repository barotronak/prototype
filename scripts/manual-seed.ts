// Manual seed script that bypasses Prisma Client instantiation issues
// Run with: npx tsx scripts/manual-seed.ts

import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { hash } from 'bcryptjs'

const prisma = new PrismaClient({})

async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

async function main() {
  console.log('🌱 Starting manual seed...')

  try {
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

    console.log('✅ Created admin user')

    // Create a doctor
    const doctorUser = await prisma.user.create({
      data: {
        email: 'dr.smith@healthcare.com',
        password: await hashPassword('doctor123'),
        name: 'Dr. John Smith',
        phone: '+1234567891',
        role: 'DOCTOR',
      },
    })

    await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        specialization: 'Cardiology',
        licenseNumber: 'DOC-CARD-001',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 15,
        consultationFee: 150.00,
        bio: 'Experienced cardiologist',
      },
    })

    console.log('✅ Created doctor')

    // Create laboratory
    const labUser = await prisma.user.create({
      data: {
        email: 'contact@citylab.com',
        password: await hashPassword('lab123'),
        name: 'City Diagnostic Laboratory',
        phone: '+1234567895',
        role: 'LABORATORY',
      },
    })

    await prisma.laboratory.create({
      data: {
        userId: labUser.id,
        labName: 'City Diagnostic Laboratory',
        address: '123 Main Street, City Center',
        licenseNumber: 'LAB-001',
        servicesOffered: ['Blood Tests', 'X-Ray', 'CT Scan'],
        operatingHours: 'Mon-Sat: 8 AM - 8 PM',
      },
    })

    console.log('✅ Created laboratory')

    // Create pharmacy
    const pharmacyUser = await prisma.user.create({
      data: {
        email: 'contact@citypharmacy.com',
        password: await hashPassword('pharmacy123'),
        name: 'City Pharmacy',
        phone: '+1234567898',
        role: 'PHARMACY',
      },
    })

    await prisma.pharmacy.create({
      data: {
        userId: pharmacyUser.id,
        pharmacyName: 'City Pharmacy',
        address: '321 Main Street, Downtown',
        licenseNumber: 'PHARM-001',
        operatingHours: 'Mon-Sat: 8 AM - 10 PM',
      },
    })

    console.log('✅ Created pharmacy')

    // Create patient
    const patientUser = await prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        password: await hashPassword('patient123'),
        name: 'John Doe',
        phone: '+1234567801',
        role: 'PATIENT',
      },
    })

    await prisma.patient.create({
      data: {
        userId: patientUser.id,
        dateOfBirth: new Date('1985-05-15'),
        gender: 'MALE',
        address: '111 Patient Lane, Residential Area',
        emergencyContact: '+1234567802',
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
      },
    })

    console.log('✅ Created patient')

    console.log('\n🎉 Database seeded successfully!\n')
    console.log('Login credentials:')
    console.log('- Admin: admin@healthcare.com / admin123')
    console.log('- Doctor: dr.smith@healthcare.com / doctor123')
    console.log('- Lab: contact@citylab.com / lab123')
    console.log('- Pharmacy: contact@citypharmacy.com / pharmacy123')
    console.log('- Patient: john.doe@email.com / patient123')
  } catch (error) {
    console.error('❌ Seed error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit())
