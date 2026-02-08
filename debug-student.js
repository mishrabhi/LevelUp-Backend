import mongoose from 'mongoose';
import User from './models/User.js';
import Job from './models/Job.js';

mongoose.connect('mongodb://localhost:27017/levelup')
  .then(async () => {
    try {
      // Get Raj Kumar
      const rajUser = await User.findOne({ email: 'student@example.com' });
      console.log('========== RAJ KUMAR PROFILE ==========');
      console.log('ID:', rajUser?._id.toString());
      console.log('Email:', rajUser?.email);
      console.log('Name:', rajUser?.name);
      console.log('Campus:', rajUser?.campus);
      console.log('Branch:', rajUser?.branch);
      console.log('Year:', rajUser?.year);
      console.log('CGPA:', rajUser?.CGPA);
      console.log('Skills:', rajUser?.skills);
      console.log('');

      // Get all jobs
      const allJobs = await Job.find({});
      console.log('========== ALL JOBS IN DATABASE ==========');
      allJobs.forEach((job, i) => {
        console.log(`\nJob ${i + 1}: ${job.jobTitle} at ${job.companyName}`);
        console.log('ID:', job._id.toString());
        console.log('Deadline:', job.applicationDeadline);
        console.log('Campuses:', job.campuses);
        console.log('Branch:', job.eligibilityCriteria.branch);
        console.log('Year:', job.eligibilityCriteria.year);
        console.log('Min CGPA:', job.eligibilityCriteria.minCGPA);
        console.log('Required Skills:', job.eligibilityCriteria.requiredSkills);
        console.log('Allowed Students IDs:', job.allowedStudents.map(s => s.toString ? s.toString() : s));
      });

      console.log('\n========== CHECKING VISIBILITY LOGIC ==========');
      
      // Check shubh1.0 job specifically
      const shubhJob = await Job.findOne({ jobTitle: 'shubh1.0' });
      if (shubhJob) {
        console.log('\nFound shubh1.0 job');
        console.log('Deadline:', shubhJob.applicationDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log('Today:', today);
        console.log('Deadline >= Today:', shubhJob.applicationDeadline >= today);
        
        console.log('\nChecking filters:');
        console.log('1. Campus match:', shubhJob.campuses.includes(rajUser.campus), `(Job: ${shubhJob.campuses}, Student: ${rajUser.campus})`);
        console.log('2. Allowed students check:', shubhJob.allowedStudents.some(s => {
          const id = s.toString ? s.toString() : s;
          return id === rajUser._id.toString();
        }), `(Job allowed: ${shubhJob.allowedStudents.map(s => s.toString ? s.toString() : s).join(', ')}, Student ID: ${rajUser._id.toString()})`);
        console.log('3. Branch match:', shubhJob.eligibilityCriteria.branch.includes(rajUser.branch), `(Job: ${shubhJob.eligibilityCriteria.branch}, Student: ${rajUser.branch})`);
        console.log('4. Year match:', shubhJob.eligibilityCriteria.year.includes(rajUser.year), `(Job: ${shubhJob.eligibilityCriteria.year}, Student: ${rajUser.year})`);
        console.log('5. CGPA check:', rajUser.CGPA >= shubhJob.eligibilityCriteria.minCGPA, `(Student: ${rajUser.CGPA}, Required: ${shubhJob.eligibilityCriteria.minCGPA})`);
      } else {
        console.log('Job "shubh1.0" not found!');
      }
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => console.error('Connection error:', err.message));
