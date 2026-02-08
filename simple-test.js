import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

(async() => {
    try {
        console.log('Testing /health...');
        const r1 = await api.get('/health');
        console.log('✅ Health:', r1.data);

        console.log('\nTesting /api/auth/register...');
        const r2 = await api.post('/api/auth/register', {
            email: 'test' + Date.now() + '@test.com',
            username: 'user' + Date.now(),
            password: 'Test123456!'
        });
        console.log('✅ Register:', r2.data);
    } catch (err) {
        console.error('❌ Error:', {
            status: err.response ? err.response.status : 'N/A',
            data: err.response ? err.response.data : 'N/A',
            message: err.message
        });
    }
})();