import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { X, Mail, Lock, User, MessageSquare, Check, Loader, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthView = 'login' | 'signup-basic' | 'email-verification' | 'phone-verification';

interface OTPData {
  emailOtp: string;
  phoneOtp: string;
  emailOtpSent: boolean;
  phoneOtpSent: boolean;
  emailOtpError: string;
  phoneOtpError: string;
  emailResendCountdown: number;
  phoneResendCountdown: number;
}

const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpData, setOtpData] = useState<OTPData>({
    emailOtp: '',
    phoneOtp: '',
    emailOtpSent: false,
    phoneOtpSent: false,
    emailOtpError: '',
    phoneOtpError: '',
    emailResendCountdown: 0,
    phoneResendCountdown: 0,
  });

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = (await authService.login({ email, password })) as any;
      if (response?.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response?.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = (await authService.register({ email, password, username })) as any;
      if (response?.success) {
        // Move to email verification
        await sendEmailOTP();
        setView('email-verification');
      } else {
        setError(response?.message || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOTP = async () => {
    setLoading(true);
    try {
      // Simulate sending OTP email
      setOtpData(prev => ({ ...prev, emailOtpSent: true }));
      startEmailResendCountdown();
    } catch (err: any) {
      setOtpData(prev => ({ ...prev, emailOtpError: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const startEmailResendCountdown = () => {
    let count = 60;
    setOtpData(prev => ({ ...prev, emailResendCountdown: count }));
    const timer = setInterval(() => {
      count--;
      setOtpData(prev => ({ ...prev, emailResendCountdown: count }));
      if (count <= 0) clearInterval(timer);
    }, 1000);
  };

  const startPhoneResendCountdown = () => {
    let count = 60;
    setOtpData(prev => ({ ...prev, phoneResendCountdown: count }));
    const timer = setInterval(() => {
      count--;
      setOtpData(prev => ({ ...prev, phoneResendCountdown: count }));
      if (count <= 0) clearInterval(timer);
    }, 1000);
  };

  const verifyEmailOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpData.emailOtp.length !== 6) {
      setOtpData(prev => ({ ...prev, emailOtpError: 'Please enter a 6-digit code' }));
      return;
    }

    setLoading(true);
    setOtpData(prev => ({ ...prev, emailOtpError: '' }));

    try {
      // Simulate OTP verification
      setOtpData(prev => ({ ...prev, emailOtp: '', emailOtpSent: false }));
      await sendPhoneOTP();
      setView('phone-verification');
    } catch (err: any) {
      setOtpData(prev => ({ ...prev, emailOtpError: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOTP = async () => {
    setLoading(true);
    try {
      setOtpData(prev => ({ ...prev, phoneOtpSent: true }));
      startPhoneResendCountdown();
    } catch (err: any) {
      setOtpData(prev => ({ ...prev, phoneOtpError: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpData.phoneOtp.length !== 6) {
      setOtpData(prev => ({ ...prev, phoneOtpError: 'Please enter a 6-digit code' }));
      return;
    }

    setLoading(true);
    setOtpData(prev => ({ ...prev, phoneOtpError: '' }));

    try {
      // Simulate OTP verification and auto-login
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setOtpData(prev => ({ ...prev, phoneOtpError: err.message }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              {view === 'login' && (
                <>
                  <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                  <p className="text-red-100 text-sm mt-1">Sign in to your account</p>
                </>
              )}
              {view === 'signup-basic' && (
                <>
                  <h2 className="text-3xl font-bold text-white">Create Account</h2>
                  <p className="text-red-100 text-sm mt-1">Join our community</p>
                </>
              )}
              {view === 'email-verification' && (
                <>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Mail className="w-7 h-7" />
                    Verify Email
                  </h2>
                  <p className="text-red-100 text-sm mt-1">We sent a code to {email}</p>
                </>
              )}
              {view === 'phone-verification' && (
                <>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-7 h-7" />
                    Verify Phone
                  </h2>
                  <p className="text-red-100 text-sm mt-1">We sent a code to {phoneNumber}</p>
                </>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-600 rounded-lg transition">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 border-t pt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setView('signup-basic');
                      setError('');
                    }}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </>
          )}

          {/* SIGNUP VIEW */}
          {view === 'signup-basic' && (
            <>
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 border-t pt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setView('login');
                      setError('');
                    }}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          )}

          {/* EMAIL VERIFICATION VIEW */}
          {view === 'email-verification' && (
            <>
              {!otpData.emailOtpSent ? (
                <button
                  onClick={sendEmailOTP}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-5 h-5" />}
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              ) : (
                <form onSubmit={verifyEmailOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      VERIFICATION CODE
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpData.emailOtp}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOtpData(prev => ({ ...prev, emailOtp: e.target.value.replace(/\D/g, '') }))
                      }
                      placeholder="000000"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-mono text-xl tracking-widest"
                    />
                  </div>

                  {otpData.emailOtpError && (
                    <div className="text-red-600 text-sm font-semibold">{otpData.emailOtpError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otpData.emailOtp.length !== 6}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={sendEmailOTP}
                      disabled={otpData.emailResendCountdown > 0}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:text-gray-400"
                    >
                      {otpData.emailResendCountdown > 0
                        ? `Resend in ${otpData.emailResendCountdown}s`
                        : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* PHONE VERIFICATION VIEW */}
          {view === 'phone-verification' && (
            <>
              {!otpData.phoneOtpSent ? (
                <button
                  onClick={sendPhoneOTP}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                  {loading ? 'Sending Code...' : 'Send SMS Code'}
                </button>
              ) : (
                <form onSubmit={verifyPhoneOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      VERIFICATION CODE
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpData.phoneOtp}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOtpData(prev => ({ ...prev, phoneOtp: e.target.value.replace(/\D/g, '') }))
                      }
                      placeholder="000000"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-mono text-xl tracking-widest"
                    />
                  </div>

                  {otpData.phoneOtpError && (
                    <div className="text-red-600 text-sm font-semibold">{otpData.phoneOtpError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otpData.phoneOtp.length !== 6}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={sendPhoneOTP}
                      disabled={otpData.phoneResendCountdown > 0}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:text-gray-400"
                    >
                      {otpData.phoneResendCountdown > 0
                        ? `Resend in ${otpData.phoneResendCountdown}s`
                        : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
