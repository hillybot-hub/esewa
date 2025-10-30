import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@blooddonation.com',
      password: adminPassword,
      role: 'admin',
      phone: '+1234567890',
      isVerified: true,
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'AC',
        zipCode: '12345',
        country: 'USA'
      },
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128] // New York coordinates
      }
    });

    // Create sample hospital
    const hospitalPassword = await bcrypt.hash('hospital123', 12);
    const hospital = await User.create({
      name: 'Dr. John Smith',
      email: 'hospital@blooddonation.com',
      password: hospitalPassword,
      role: 'hospital',
      phone: '+1234567891',
      hospitalName: 'City General Hospital',
      licenseNumber: 'HOSP123456',
      isVerified: true,
      address: {
        street: '456 Medical Center Dr',
        city: 'Metropolis',
        state: 'MC',
        zipCode: '12346',
        country: 'USA'
      },
      location: {
        type: 'Point',
        coordinates: [-74.005, 40.7138]
      },
      bloodInventory: {
        'A+': 15,
        'A-': 5,
        'B+': 10,
        'B-': 3,
        'AB+': 8,
        'AB-': 2,
        'O+': 20,
        'O-': 6
      },
      facilities: ['Emergency', 'ICU', 'Laboratory', 'Pharmacy'],
      operatingHours: {
        open: '08:00',
        close: '20:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      }
    });

    // Create sample donor
    const donorPassword = await bcrypt.hash('donor123', 12);
    const donor = await User.create({
      name: 'Alice Johnson',
      email: 'donor@blooddonation.com',
      password: donorPassword,
      role: 'donor',
      phone: '+1234567892',
      bloodType: 'O+',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'female',
      isVerified: true,
      isAvailable: true,
      address: {
        street: '789 Donor Lane',
        city: 'Metropolis',
        state: 'MC',
        zipCode: '12347',
        country: 'USA'
      },
      location: {
        type: 'Point',
        coordinates: [-74.007, 40.7118]
      },
      lastDonationDate: new Date('2024-01-15'),
      donationCount: 5,
      healthConditions: []
    });

    // Create sample receiver
    const receiverPassword = await bcrypt.hash('receiver123', 12);
    const receiver = await User.create({
      name: 'Bob Wilson',
      email: 'receiver@blooddonation.com',
      password: receiverPassword,
      role: 'receiver',
      phone: '+1234567893',
      isVerified: true,
      address: {
        street: '321 Receiver Road',
        city: 'Metropolis',
        state: 'MC',
        zipCode: '12348',
        country: 'USA'
      },
      location: {
        type: 'Point',
        coordinates: [-74.004, 40.7148]
      }
    });

    console.log('🎉 Database seeded successfully!');
    console.log('📋 Sample Users Created:');
    console.log('   👨‍💼 Admin: admin@blooddonation.com / admin123');
    console.log('   🏥 Hospital: hospital@blooddonation.com / hospital123');
    console.log('   🩸 Donor: donor@blooddonation.com / donor123');
    console.log('   💊 Receiver: receiver@blooddonation.com / receiver123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedData();