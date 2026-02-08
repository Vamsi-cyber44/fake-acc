// Test script to verify backend API is working
// Add this to your browser console (F12) and run it

async function testBackendAPI() {
    console.log('🔍 Testing Backend Connection...\n');

    // Test 1: Health Check
    try {
        console.log('Test 1: Health Check');
        const healthRes = await fetch('http://localhost:8000/health');
        const healthData = await healthRes.json();
        console.log('✅ Health Status:', healthData);
    } catch (e) {
        console.error('❌ Health Check Failed:', e.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Login API
    try {
        console.log('Test 2: Login API (with wrong credentials)');
        const loginRes = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword'
            })
        });
        const loginData = await loginRes.json();
        console.log('Response Status:', loginRes.status);
        console.log('Response Data:', loginData);
        if (loginRes.status === 401 || loginRes.status === 400) {
            console.log('✅ API is responding correctly (error expected with wrong credentials)');
        }
    } catch (e) {
        console.error('❌ Login API Failed:', e.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Register API
    try {
        console.log('Test 3: Register API');
        const randomId = Date.now();
        const registerRes = await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${randomId}@example.com`,
                username: `testuser${randomId}`,
                password: 'Test123!@#'
            })
        });
        const registerData = await registerRes.json();
        console.log('Response Status:', registerRes.status);
        console.log('Response Data:', registerData);
        if (registerRes.status === 201 || registerRes.ok) {
            console.log('✅ Registration API is working');
        }
    } catch (e) {
        console.error('❌ Register API Failed:', e.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('Testing complete!');
}

// Run the test
testBackendAPI();