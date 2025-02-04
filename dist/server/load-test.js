const http = require('http');

const CONCURRENT_USERS = 20;
const REQUESTS_PER_USER = 10;
const BASE_URL = 'http://localhost:5000';

const endpoints = [
  '/api/health',
  '/api/user/testuser',
];

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    http.get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({ 
          endpoint, 
          status: res.statusCode, 
          duration,
          timestamp: new Date().toISOString()
        });
      });
    }).on('error', reject);
  });
}

async function simulateUser(userId) {
  console.log(`User ${userId} started`);
  const results = [];
  
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    try {
      const result = await makeRequest(endpoint);
      results.push(result);
      console.log(`User ${userId}, Request ${i + 1}: ${endpoint} - ${result.status} (${result.duration}ms)`);
    } catch (error) {
      console.error(`User ${userId}, Request ${i + 1} failed:`, error.message);
    }
    // Add small random delay between requests
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  }
  return results;
}

async function runLoadTest() {
  console.log(`Starting load test with ${CONCURRENT_USERS} concurrent users`);
  console.log(`Each user will make ${REQUESTS_PER_USER} requests`);
  
  const startTime = Date.now();
  
  const users = Array.from({ length: CONCURRENT_USERS }, (_, i) => simulateUser(i + 1));
  const results = await Promise.all(users);
  
  const totalDuration = Date.now() - startTime;
  const flatResults = results.flat();
  
  // Calculate statistics
  const totalRequests = flatResults.length;
  const avgDuration = flatResults.reduce((sum, r) => sum + r.duration, 0) / totalRequests;
  const successRate = (flatResults.filter(r => r.status === 200).length / totalRequests) * 100;
  
  console.log('\nLoad Test Results:');
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
  console.log(`Success Rate: ${successRate.toFixed(2)}%`);
}

runLoadTest().catch(console.error);
