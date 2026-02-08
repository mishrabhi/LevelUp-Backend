import mongoose from 'mongoose';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

mongoose.connect('mongodb://localhost:27017/levelup')
  .then(async () => {
    try {
      console.log('🔍 Checking for duplicate users...\n');

      // Find all students named Raj Kumar
      const rajUsers = await User.find({ email: 'student@example.com' });
      
      if (rajUsers.length > 1) {
        console.log(`⚠️  Found ${rajUsers.length} Raj Kumar users!\n`);
        
        rajUsers.forEach((user, i) => {
          console.log(`${i + 1}. ${user.name}`);
          console.log(`   ID: ${user._id.toString()}`);
          console.log(`   Created: ${user.createdAt}`);
          console.log('');
        });

        // Keep the newest one, delete older ones
        const sorted = rajUsers.sort((a, b) => b.createdAt - a.createdAt);
        const keepUser = sorted[0];
        const deleteUsers = sorted.slice(1);

        console.log(`✓ Keeping: ${keepUser._id.toString()} (${keepUser.createdAt})`);
        console.log(`✗ Deleting: ${deleteUsers.map(u => u._id.toString()).join(', ')}\n`);

        // Delete old duplicate users and their applications
        for (const oldUser of deleteUsers) {
          console.log(`Deleting user: ${oldUser._id.toString()}`);
          
          // Delete applications by this user
          await Application.deleteMany({ studentId: oldUser._id });
          
          // Delete the user
          await User.deleteOne({ _id: oldUser._id });
          
          console.log(`  ✓ Deleted user and their applications`);
        }

        console.log('\n✅ Duplicate users cleaned up!');
      } else {
        console.log('✓ No duplicate users found');
      }

      // Check all students
      const allStudents = await User.find({ role: 'Student' });
      console.log(`\n========== REMAINING STUDENTS ==========\n`);
      console.log(`Total: ${allStudents.length}\n`);
      
      allStudents.forEach(student => {
        console.log(`${student.name}`);
        console.log(`  ID: ${student._id.toString()}`);
        console.log(`  Email: ${student.email}`);
        console.log(`  Campus: ${student.campus}`);
        console.log('');
      });

    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => console.error('Connection error:', err.message));
