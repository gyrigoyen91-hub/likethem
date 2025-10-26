// Test script to verify JWT token contains role
const { getToken } = require('next-auth/jwt');

async function testJWT() {
  try {
    // Simulate a request with a mock token
    const mockReq = {
      headers: {
        cookie: 'next-auth.session-token=test-token'
      }
    };
    
    const token = await getToken({ 
      req: mockReq, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log('JWT Token:', token);
  } catch (error) {
    console.error('Error testing JWT:', error);
  }
}

testJWT();
