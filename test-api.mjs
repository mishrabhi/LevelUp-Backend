import fetch from 'node-fetch';

async function testAPI() {
  try {
    // Login as student
    console.log('========== LOGGING IN AS STUDENT ==========');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'student123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    
    if (!loginData.token) {
      console.log('Login failed!');
      return;
    }
    
    const token = loginData.token;
    const studentId = loginData.user._id;
    
    console.log('\n========== FETCHING AVAILABLE JOBS ==========');
    const jobsRes = await fetch('http://localhost:5000/api/jobs/available', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const jobs = await jobsRes.json();
    console.log(`Found ${jobs.length} available jobs:`);
    jobs.forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.jobTitle} at ${job.companyName}`);
      console.log('   Deadline:', job.applicationDeadline);
      console.log('   Campuses:', job.campuses);
      console.log('   Allowed Students:', job.allowedStudents);
    });
    
    console.log('\n========== CHECKING FOR shubh1.0 JOB ==========');
    const shubhJob = jobs.find(j => j.jobTitle === 'shubh1.0');
    if (shubhJob) {
      console.log('✓ Found shubh1.0 job!');
      console.log('Details:', shubhJob);
    } else {
      console.log('✗ shubh1.0 job NOT found in available jobs');
      
      // Check if it exists in the database
      console.log('\n========== CHECKING ALL JOBS (ADMIN VIEW) ==========');
      const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      });
      
      const adminLoginData = await adminLoginRes.json();
      const adminToken = adminLoginData.token;
      
      const allJobsRes = await fetch('http://localhost:5000/api/jobs', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      const allJobsData = await allJobsRes.json();
      const allJobs = allJobsData.jobs || allJobsData;
      
      console.log(`\nTotal jobs in database: ${allJobs.length}`);
      allJobs.forEach((job, i) => {
        console.log(`\n${i + 1}. ${job.jobTitle} at ${job.companyName}`);
        console.log('   ID:', job._id);
        console.log('   Campuses:', job.campuses);
      });
      
      const shubhInAll = allJobs.find(j => j.jobTitle === 'shubh1.0');
      if (shubhInAll) {
        console.log('\n\n========== shubh1.0 FOUND BUT NOT VISIBLE TO STUDENT ==========');
        console.log('Job Details:');
        console.log('  Deadline:', shubhInAll.applicationDeadline);
        console.log('  Campuses:', shubhInAll.campuses);
        console.log('  Branch:', shubhInAll.eligibilityCriteria.branch);
        console.log('  Year:', shubhInAll.eligibilityCriteria.year);
        console.log('  Min CGPA:', shubhInAll.eligibilityCriteria.minCGPA);
        console.log('  Required Skills:', shubhInAll.eligibilityCriteria.requiredSkills);
        console.log('  Allowed Students:', shubhInAll.allowedStudents);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
