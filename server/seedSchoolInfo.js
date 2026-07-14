/**
 * OAV School Info Seeder
 * Run once: node seedSchoolInfo.js
 * Populates the SchoolInfo document with official school data.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const SchoolInfo = require('./models/SchoolInfo');

const SCHOOL_DATA = {
  isSingleton: true,
  schoolName: 'Whispering Pines School',
  tagline: 'Excellence in Every Step — Nurturing Bright Futures',
  overview: `Whispering Pines School is a premier residential school committed to providing quality education to students. The school is affiliated with the Central Board of Secondary Education (CBSE) and is committed to academic excellence.

Located in a serene environment, the school offers a vibrant learning environment that blends academic rigour with holistic development. Whispering Pines School provides excellent education and ensures that every deserving child has access to world-class schooling.

The school fosters a culture of discipline, creativity, and leadership. With a dedicated faculty, modern infrastructure, and a strong focus on both curricular and co-curricular excellence, Whispering Pines School is shaping the next generation of responsible citizens and future leaders.`,
  principalName: 'Dr. Rajesh K. Mohapatra',
  principalMessage: 'Welcome to Whispering Pines School. Our mission is to nurture every student\'s potential by providing a safe, inspiring, and inclusive learning environment. We believe that education is the most powerful instrument of transformation, and we remain committed to guiding each child towards excellence — academically, morally, and socially.',
  principalPhoto: '',
  principalQualification: 'M.Sc., M.Ed., Ph.D. in Education',
  principalExperience: '25 Years',
  principalAchievements: 'State Award for Teachers (2018), National Award for Innovation in Educational Administration',
  principalBio: 'Dr. Rajesh K. Mohapatra has dedicated his life to the field of education. With over two decades of experience in school administration and teaching, he believes in a holistic approach to student development.',
  establishedYear: '2020',
  affiliation: 'CBSE',
  address: 'At- Sanagarh, Near Ranpur Fire Station, PO/Block- Ranpur',
  city: 'Ranpur, Nayagarh',
  state: 'Odisha',
  phone: '+91 8117824928',
  altPhone: '',
  email: 'wphunkshuk@gmail.com',
  website: 'https://whisperingpines.edu',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3747.499516536102!2d85.32837877500432!3d20.071395481349068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1843ca696ab211%3A0xc9d5a92bdfa2ced1!2sOdisha%20Adarsha%20Vidyalaya%2C%20Ranpur%2C%20Nayagarh!5e0!3m2!1sen!2sin!4v1783097303933!5m2!1sen!2sin',
  socialLinks: {
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: '',
  },
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await SchoolInfo.findOneAndUpdate(
      { isSingleton: true },
      SCHOOL_DATA,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('✅ School info seeded successfully!');
    console.log('   School Name :', result.schoolName);
    console.log('   Principal   :', result.principalName);
    console.log('   Phone       :', result.phone);
    console.log('   Email       :', result.email);
    console.log('   Address     :', result.address + ', ' + result.city + ', ' + result.state);
    console.log('   Affiliation :', result.affiliation);
    console.log('   Est. Year   :', result.establishedYear);
    console.log('   Website     :', result.website);
    
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
