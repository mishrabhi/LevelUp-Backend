import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

dotenv.config();

const diagnoseJob = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // Get Raj Kumar (student@example.com)
    const student = await User.findOne({ email: 'student@example.com' });
    
    if (!student) {
      console.log('❌ Student not found');
      process.exit(1);
    }

    console.log('👤 STUDENT DATA:');
    console.log('  Name:', student.name);
    console.log('  ID:', student._id.toString());
    console.log('  Role:', student.role);
    console.log('  Campus:', student.campus);
    console.log('  Branch:', student.branch);
    console.log('  Year:', student.year);
    console.log('  CGPA:', student.CGPA);
    console.log('  Skills:', student.skills);

    // Get all jobs
    const jobs = await Job.find().populate('allowedStudents', 'name email _id');

    console.log('\n📋 ALL JOBS IN DATABASE:\n');

    jobs.forEach((job, index) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isActive = job.applicationDeadline >= today;

      console.log(`${index + 1}. ${job.jobTitle} (${job.companyName})`);
      console.log(`   Status: ${isActive ? '✅ ACTIVE' : '❌ OVER DEADLINE'}`);
      console.log(`   Deadline: ${job.applicationDeadline.toDateString()}`);
      console.log(`   Campuses: [${job.campuses.join(', ')}]`);
      console.log(`   Allowed Students: [${job.allowedStudents.map(s => `${s.name}(${s._id.toString()})`).join(', ')}]`);
      
      console.log(`   Eligibility Criteria:`);
      console.log(`     - Branch: [${job.eligibilityCriteria.branch.join(', ')}]`);
      console.log(`     - Year: [${job.eligibilityCriteria.year.join(', ')}]`);
      console.log(`     - MinCGPA: ${job.eligibilityCriteria.minCGPA}`);
      console.log(`     - Required Skills: [${job.eligibilityCriteria.requiredSkills.join(', ')}]`);

      // Check if student is eligible
      console.log(`   ═══ ELIGIBILITY CHECK FOR RAJ KUMAR ═══`);
      
      // 1. Campus check
      const campusMatch = job.campuses.length === 0 || job.campuses.includes(student.campus);
      console.log(`   Campus Match: ${campusMatch ? '✅' : '❌'} (Student: ${student.campus}, Job requires: [${job.campuses.join(', ')}])`);

      // 2. Allowed Students check
      const isInAllowedList = job.allowedStudents.some(s => s._id.toString() === student._id.toString());
      console.log(`   In Allowed List: ${isInAllowedList ? '✅' : '❌'} (Job allows: [${job.allowedStudents.map(s => s._id.toString()).join(', ')}], Student ID: ${student._id.toString()})`);

      // 3. Branch check
      const branchMatch = job.eligibilityCriteria.branch.length === 0 || job.eligibilityCriteria.branch.includes(student.branch);
      console.log(`   Branch Match: ${branchMatch ? '✅' : '❌'} (Student: ${student.branch}, Job requires: [${job.eligibilityCriteria.branch.join(', ')}])`);

      // 4. Year check
      const yearMatch = job.eligibilityCriteria.year.length === 0 || job.eligibilityCriteria.year.includes(student.year);
      console.log(`   Year Match: ${yearMatch ? '✅' : '❌'} (Student: ${student.year}, Job requires: [${job.eligibilityCriteria.year.join(', ')}])`);

      // 5. CGPA check
      const cgpaMatch = !student.CGPA || !job.eligibilityCriteria.minCGPA || student.CGPA >= job.eligibilityCriteria.minCGPA;
      console.log(`   CGPA Match: ${cgpaMatch ? '✅' : '❌'} (Student: ${student.CGPA}, Job requires: ${job.eligibilityCriteria.minCGPA})`);

      // 6. Skills check
      const hasAllRequiredSkills = job.eligibilityCriteria.requiredSkills.length === 0 || job.eligibilityCriteria.requiredSkills.some(skill =>
        student.skills && student.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
      );
      console.log(`   Skills Match: ${hasAllRequiredSkills ? '✅' : '❌'} (Student: [${student.skills.join(', ')}], Job requires: [${job.eligibilityCriteria.requiredSkills.join(', ')}])`);

      // Overall eligibility
      const isEligible = campusMatch && isInAllowedList && branchMatch && yearMatch && cgpaMatch && hasAllRequiredSkills && isActive;
      console.log(`   ═════════════════════════════════════`);
      console.log(`   OVERALL: ${isEligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

diagnoseJob();
