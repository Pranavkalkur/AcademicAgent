import jwt from 'jsonwebtoken';

async function test() {
  const token = jwt.sign({ id: '64a2f8c5b565a0b7e28972af', username: 'testuser' }, 'hackathon_secret', { expiresIn: '1h' });
  
  try {
    const res = await fetch('http://localhost:5000/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Subject',
        subjectCode: '101',
        semester: 1,
        theme: { color: '#000', icon: '🚀' }
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}

test();
