const base = 'http://localhost:5000';
const loginRes = await fetch(base + '/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@jobfinder.com', password: 'Admin@123' })
});
console.log('LOGIN_STATUS=' + loginRes.status);
const loginData = await loginRes.json();
console.log('LOGIN_KEYS=' + Object.keys(loginData || {}).join(','));
const token = loginData && (loginData.token || loginData.data?.token || loginData.user?.token);
console.log('TOKEN_PRESENT=' + Boolean(token));
if (!token) process.exit(0);
const jobsRes = await fetch(base + '/jobs?page=1&limit=5', {
  headers: { Authorization: 'Bearer ' + token }
});
console.log('JOBS_STATUS=' + jobsRes.status);
const jobsData = await jobsRes.json();
const jobs = jobsData && (jobsData.jobs || jobsData);
console.log('JOBS_COUNT=' + (Array.isArray(jobs) ? jobs.length : 'NA'));
const firstId = jobs && jobs[0] && (jobs[0].id || jobs[0].jobId);
console.log('FIRST_ID=' + (firstId || 'NONE'));
if (!firstId) process.exit(0);
const genRes = await fetch(base + '/jobs/' + firstId + '/generate-latex', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + token }
});
console.log('GEN_STATUS=' + genRes.status);
const genText = await genRes.text();
console.log(genText.slice(0, 1500));
