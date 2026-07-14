require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function updateNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Update SchoolInfo
    await db.collection('schoolinfos').updateOne(
      { isSingleton: true },
      {
        $set: {
          principalName: 'Dr. Rajesh K. Mohapatra',
          principalQualification: 'M.Sc., M.Ed., Ph.D. in Education',
          principalExperience: '25 Years',
          principalAchievements: 'State Award for Teachers (2018), National Award for Innovation in Educational Administration',
          principalBio: 'Dr. Rajesh K. Mohapatra has dedicated his life to the field of education. With over two decades of experience in school administration and teaching, he believes in a holistic approach to student development.',
        }
      }
    );
    console.log('Updated SchoolInfo Principal Details');

    // Update Teachers
    const teachers = await db.collection('users').find({ role: 'teacher' }).toArray();
    
    const indianNames = [
      { name: 'Sanjay Kumar Sahoo', qual: 'B.Sc., B.Ed.', exp: '5 Years' },
      { name: 'Harihara Dash', qual: 'M.A., B.Ed.', exp: '10 Years' },
      { name: 'Deepak Ranjan Nayak', qual: 'M.Sc., M.Ed.', exp: '12 Years' },
      { name: 'Ankit Patnaik', qual: 'B.A., B.Ed.', exp: '4 Years' },
      { name: 'Pragyan Paramita', qual: 'M.Sc. (IT), B.Ed.', exp: '6 Years' },
      { name: 'Sunil Kumar Behera', qual: 'M.Com, B.Ed.', exp: '8 Years' }
    ];

    for (let i = 0; i < teachers.length; i++) {
      const t = teachers[i];
      const newDetails = indianNames[i % indianNames.length];
      
      await db.collection('users').updateOne(
        { _id: t._id },
        {
          $set: {
            name: newDetails.name,
            qualification: newDetails.qual,
            experience: newDetails.exp,
            achievements: 'Excellent Academic Records',
            bio: 'Dedicated teacher with a passion for student success.'
          }
        }
      );
      console.log(`Updated teacher ${t.name} to ${newDetails.name}`);
    }

    // Also update Admin names just in case they are shown in UI
    await db.collection('users').updateOne(
      { email: 'admin1@school.com' },
      { $set: { name: 'Principal (Dr. Rajesh K. Mohapatra)' } }
    );
    
    await db.collection('users').updateOne(
      { email: 'admin2@school.com' },
      { $set: { name: 'Vice Principal (Sunita Rath)' } }
    );
    console.log('Updated Admins');

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

updateNames();
