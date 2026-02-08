import axios from 'axios';

async function test() {
    try {
        const email = `test${Date.now()}@test.com`;
        const password = 'Test123456!';

        console.log('📝 Registering user...');
        const res = await axios.post('http://localhost:8000/api/auth/register', {
            email,
            username: `user${Date.now()}`,
            password,
            confirmPassword: password
        });

        console.log('✅ Registration successful!');
        console.log('Response:', JSON.stringify(res.data, null, 2));

        console.log('\n🔐 Testing login...');
        const loginRes = await axios.post('http://localhost:8000/api/auth/login', {
            email,
            password
        });

        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(loginRes.data, null, 2));
        console.log('\n🎉 Data persistence working!');
    } catch (err) {
        console.error('❌ Error:', err.response ? err.response.data : err.message);
    }
}

test();