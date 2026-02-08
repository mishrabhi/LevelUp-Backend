import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/levelup')
  .then(async () => {
    try {
      // Find all users with student email
      const allRaj = await User.find({ email: 'student@example.com' });
      
      console.log('========== CHECKING FOR DUPLICATE USERS ==========\n');
      console.log(`Found ${allRaj.length} user(s) with email: student@example.com\n`);
      
      allRaj.forEach((user, i) => {
        console.log(`User ${i + 1}:`);
        console.log('  ID:', user._id.toString());
        console.log('  Name:', user.name);
        console.log('  Email:', user.email);
        console.log('  Campus:', user.campus);
        console.log('  Created:', user.createdAt);
        console.log('');
      });

      if (allRaj.length > 1) {
        console.log('⚠️  DUPLICATE USERS FOUND!\n');
        console.log('This is the problem:');
        console.log(`  Old ID: ${allRaj[0]._id.toString()}`);
        console.log(`  New ID: ${allRaj[1]._id.toString()}`);
        console.log('\nWe need to delete the old one and keep the new one.');
      }

      // Check all students
      console.log('\n========== ALL STUDENTS IN DATABASE ==========\n');
      const allStudents = await User.find({ role: 'Student' });
      console.log(`Total students: ${allStudents.length}\n`);
      
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
