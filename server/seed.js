require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const SchoolInfo = require('./models/SchoolInfo');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing admin count
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount >= 2) {
      console.log(`⚠️  Already ${adminCount} admin account(s) exist. Skipping admin creation.`);
    } else {
      const adminsToCreate = [];

      const admin1Exists = await User.findOne({ email: process.env.ADMIN1_EMAIL });
      if (!admin1Exists) {
        adminsToCreate.push({
          name: process.env.ADMIN1_NAME || 'Principal Admin',
          email: process.env.ADMIN1_EMAIL || 'admin1@school.com',
          password: process.env.ADMIN1_PASSWORD || 'Admin@1234',
          role: 'admin',
          isActive: true,
        });
      }

      const admin2Exists = await User.findOne({ email: process.env.ADMIN2_EMAIL });
      if (!admin2Exists && adminCount + adminsToCreate.length < 2) {
        adminsToCreate.push({
          name: process.env.ADMIN2_NAME || 'Vice Principal',
          email: process.env.ADMIN2_EMAIL || 'admin2@school.com',
          password: process.env.ADMIN2_PASSWORD || 'Admin@5678',
          role: 'admin',
          isActive: true,
        });
      }

      if (adminsToCreate.length > 0) {
        for (const adminData of adminsToCreate) {
          await User.create(adminData);
          console.log(`✅ Created admin: ${adminData.email} (password: ${adminData.password})`);
        }
      }
    }

    // Seed School Info singleton if not exists
    const infoExists = await SchoolInfo.findOne();
    if (!infoExists) {
      await SchoolInfo.create({
        schoolName: 'Whispering Pines School',
        tagline: 'Whispering Pines School — Excellence in Every Step',
        overview: 'Whispering Pines School is a premier residential school committed to academic excellence, character development, and holistic growth of every student. We provide quality education with modern infrastructure in a nurturing environment.',
        principalName: 'Principal',
        principalMessage: 'Welcome to Whispering Pines School! Our mission is to create a vibrant learning environment where every student can discover their potential, develop critical thinking skills, and grow into responsible citizens of tomorrow.',
        establishedYear: '2016',
        affiliation: 'BSE Odisha',
        address: 'Balarampur, Ranpur',
        city: 'Ranpur',
        state: 'Odisha',
        phone: '',
        email: 'contact@whisperingpines.edu',
      });
      console.log('✅ School info seeded');
    } else {
      console.log('⚠️  School info already exists. Skipping.');
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('─────────────────────────────────────');
    console.log('Admin 1:', process.env.ADMIN1_EMAIL || 'admin1@school.com');
    console.log('Admin 2:', process.env.ADMIN2_EMAIL || 'admin2@school.com');
    console.log('─────────────────────────────────────');
    console.log('⚠️  IMPORTANT: Change admin passwords after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
