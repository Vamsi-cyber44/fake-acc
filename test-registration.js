// Test registration and verify data is being saved
import axios from 'axios';

const API_URL = 'http://localhost:8000';

async function testRegistration() {
    try {
        console.log('\n📝 Testing User Registration...\n');

        const testUser = {
            email: `testuser${Date.now()}@test.com`,
            username: `testuser${Date.now()}`,
            password: 'TestPassword123!'
        };

        console.log('Registering user:', {
            email: testUser.email,
            username: testUser.username
        });

        const response = await axios.post(`${API_URL}/api/auth/register`, testUser);

        console.log('\n✅ Registration Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log(`\nUser ID: ${response.data.userId}`);

        // Now try to login with the same user
        console.log('\n🔐 Testing Login...\n');

        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        console.log('✅ Login Response:');
        console.log(JSON.stringify(loginResponse.data, null, 2));
        console.log('\n🎉 Data is being persisted successfully!');

    } catch (error) {
        console.error('\n❌ Error occurred:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

testRegistration();