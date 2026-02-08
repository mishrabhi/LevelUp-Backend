import fetch from 'node-fetch';

const test = async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'student123' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    const jobsRes = await fetch('http://localhost:5000/api/jobs/available', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const jobs = await jobsRes.json();
    console.log('Available jobs for Raj Kumar:');
    console.log(`Total: ${jobs.length}\n`);
    
    jobs.forEach(job => {
      console.log(`✓ ${job.jobTitle} at ${job.companyName}`);
    });
  } catch (err) {
    console.error(err);
  }
};

test();
