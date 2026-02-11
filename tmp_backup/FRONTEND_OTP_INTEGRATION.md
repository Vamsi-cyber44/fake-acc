# 🎯 Frontend Integration Guide - Email & Mobile OTP Verification

## Quick Integration Steps

### 1. Email Verification Signup Flow

```typescript
// Step 1: Register user with email and optional phone
const registerResponse = await axios.post('/api/auth/register', {
  email: 'user@example.com',
  username: 'username123',
  password: 'SecurePassword@123',
  confirmPassword: 'SecurePassword@123',
  phoneNumber: '9876543210',  // Optional
  firstName: 'John',
  lastName: 'Doe'
});

// Step 2: Send OTP to email
const sendOtpResponse = await axios.post('/api/auth/send-otp', {
  email: 'user@example.com'
});
// Shows: "OTP sent to your email"

// Step 3: User enters OTP (6 digits)
// Step 4: Verify OTP
const verifyOtpResponse = await axios.post('/api/auth/verify-otp', {
  email: 'user@example.com',
  otp: '630580'  // User enters this
});
// Response: { success: true, message: "Email verified successfully" }
```

---

### 2. Mobile Verification Flow

```typescript
// Step 1: Send SMS OTP to phone
const sendSmsResponse = await axios.post('/api/auth/send-sms-otp', {
  phoneNumber: '9876543210',
  email: 'user@example.com'  // Optional - for backup notification
});
// Shows: "SMS OTP sent to your phone"

// Step 2: User enters OTP from SMS (6 digits)
// Step 3: Verify SMS OTP
const verifySmsResponse = await axios.post('/api/auth/verify-sms-otp', {
  phoneNumber: '9876543210',
  otp: '845720'  // User enters this from SMS
});
// Response: { success: true, message: "Phone number verified successfully" }
```

---

### 3. Resend OTP (User Clicked "Didn't Receive?")

```typescript
// Resend Email OTP
const resendEmailOtp = await axios.post('/api/auth/resend-otp', {
  email: 'user@example.com'
});

// OR Resend SMS OTP
const resendSmsOtp = await axios.post('/api/auth/resend-sms-otp', {
  phoneNumber: '9876543210',
  email: 'user@example.com'  // Optional
});
```

---

### 4. Error Handling

```typescript
try {
  const response = await axios.post('/api/auth/verify-otp', {
    email: 'user@example.com',
    otp: userEnteredOtp
  });
  
  console.log('✅ Email verified!');
} catch (error) {
  if (error.response?.status === 400) {
    const { attemptsRemaining } = error.response.data;
    console.error(`❌ Invalid OTP. ${attemptsRemaining} attempts remaining`);
    
    if (attemptsRemaining === 0) {
      // Show "Resend OTP" button
      showResendButton = true;
    }
  }
}
```

---

## 🛠️ Frontend Component Example

### React: Email OTP Verification Component

```typescript
import React, { useState } from 'react';
import axios from 'axios';

export const EmailVerification = ({ email }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Send OTP
  const handleSendOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/send-otp', { email });
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      setMessage(`❌ Failed to send OTP`);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/verify-otp', {
        email,
        otp
      });
      setMessage(`✅ ${response.data.message}`);
      setIsVerified(true);
    } catch (error) {
      setAttemptsRemaining(error.response?.data?.attemptsRemaining || 0);
      setMessage(`❌ ${error.response?.data?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/resend-otp', { email });
      setOtp('');
      setAttemptsRemaining(5);
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      setMessage(`❌ Failed to resend OTP`);
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return <div className="success">✅ Email verified successfully!</div>;
  }

  return (
    <div className="verification-container">
      <h3>Verify Your Email</h3>
      <p>{email}</p>

      <button onClick={handleSendOTP} disabled={loading}>
        Send OTP
      </button>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.slice(0, 6))}
        placeholder="Enter 6-digit OTP"
        maxLength="6"
        disabled={loading}
      />

      <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
        Verify OTP
      </button>

      <button onClick={handleResendOTP} disabled={loading}>
        Resend OTP
      </button>

      {message && <p className={message.includes('✅') ? 'success' : 'error'}>{message}</p>}
      <p className="attempts">Attempts remaining: {attemptsRemaining}/5</p>
    </div>
  );
};
```

### React: Phone Verification Component

```typescript
import React, { useState } from 'react';
import axios from 'axios';

export const PhoneVerification = ({ phoneNumber, email }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [message, setMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSendSMSOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/send-sms-otp', {
        phoneNumber,
        email
      });
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySMSOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/verify-sms-otp', {
        phoneNumber,
        otp
      });
      setMessage(`✅ ${response.data.message}`);
      setIsVerified(true);
    } catch (error) {
      setAttemptsRemaining(error.response?.data?.attemptsRemaining || 0);
      setMessage(`❌ ${error.response?.data?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendSMSOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/resend-sms-otp', {
        phoneNumber,
        email
      });
      setOtp('');
      setAttemptsRemaining(5);
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      setMessage(`❌ Failed to resend OTP`);
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return <div className="success">✅ Phone verified successfully!</div>;
  }

  return (
    <div className="verification-container">
      <h3>Verify Your Phone</h3>
      <p>+91 {phoneNumber}</p>

      <button onClick={handleSendSMSOTP} disabled={loading}>
        Send SMS OTP
      </button>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.slice(0, 6))}
        placeholder="Enter 6-digit OTP from SMS"
        maxLength="6"
        disabled={loading}
      />

      <button onClick={handleVerifySMSOTP} disabled={loading || otp.length !== 6}>
        Verify SMS OTP
      </button>

      <button onClick={handleResendSMSOTP} disabled={loading}>
        Resend SMS
      </button>

      {message && <p className={message.includes('✅') ? 'success' : 'error'}>{message}</p>}
      <p className="attempts">Attempts remaining: {attemptsRemaining}/5</p>
    </div>
  );
};
```

---

## 📱 Complete Signup Flow (Multi-Step)

```typescript
export const SignupFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  // Step 1: Registration
  const handleRegister = async () => {
    try {
      const response = await axios.post('/api/auth/register', formData);
      setStep(2); // Move to email verification
    } catch (error) {
      alert('Registration failed: ' + error.response?.data?.message);
    }
  };

  // Step 2: Email Verification
  const handleEmailVerification = async (otp) => {
    try {
      await axios.post('/api/auth/verify-otp', {
        email: formData.email,
        otp
      });
      if (formData.phoneNumber) {
        setStep(3); // Move to phone verification
      } else {
        setStep(4); // Complete
      }
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  // Step 3: Phone Verification
  const handlePhoneVerification = async (otp) => {
    try {
      await axios.post('/api/auth/verify-sms-otp', {
        phoneNumber: formData.phoneNumber,
        otp
      });
      setStep(4); // Complete
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  if (step === 1) {
    return <RegistrationForm onSubmit={handleRegister} />;
  } else if (step === 2) {
    return <EmailVerification email={formData.email} onSuccess={() => {}} />;
  } else if (step === 3) {
    return <PhoneVerification phoneNumber={formData.phoneNumber} email={formData.email} />;
  } else {
    return <CompleteScreen />;
  }
};
```

---

## 🔌 API Base URL Configuration

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Export for use
export default apiClient;
```

---

## ✅ Verification States

| State | Email Verified | Phone Verified | Can Login |
|-------|---|---|---|
| New Signup | ❌ | ❌ | ❌ |
| Email Only | ✅ | N/A | ✅ |
| Email + Phone | ✅ | ✅ | ✅ |
| Phone Only | ❌ | ✅ | ❌ (if registered) |
| Dev Mode | ✅ (auto) | ✅ (auto) | ✅ |

---

## 🎨 UI/UX Tips

1. **OTP Input**: Use separate input boxes (one for each digit) for better UX
2. **Timer**: Show countdown timer (10 min for email, 5 min for SMS)
3. **Resend**: Disable resend button for 30 seconds after initial send
4. **Validation**: Show real-time validation for OTP input
5. **Error Messages**: Display attempt count to warn users
6. **Success State**: Show checkmark and confirmation message

---

## 🧪 Testing Checklist

- [ ] Send email OTP works
- [ ] Verify email OTP works
- [ ] Resend email OTP works
- [ ] Invalid email OTP shows attempt count
- [ ] Send SMS OTP works
- [ ] Verify SMS OTP works
- [ ] Resend SMS OTP works
- [ ] Invalid SMS OTP shows attempt count
- [ ] Login blocked before verification
- [ ] Login works after verification
- [ ] Phone number optional in signup
- [ ] Different users have independent OTPs

---

## 📝 Notes

- OTP codes are **6 digits** (100,000 to 999,999)
- Email OTP expires in **10 minutes**
- SMS OTP expires in **5 minutes**
- Max **5 attempts** per OTP
- Phone numbers are **optional** in signup
- **Development mode** auto-verifies all users

---

**Last Updated**: 2026-02-02
**Version**: 1.0.0
