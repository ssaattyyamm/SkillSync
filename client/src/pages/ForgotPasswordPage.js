import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, Mail, KeyRound, Lock, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';
import './ForgotPasswordPage.css';

const STEPS = {
  EMAIL:    1,  
  OTP:      2,  
  PASSWORD: 3,  
  SUCCESS:  4   
};

export default function ForgotPasswordPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setStep(STEPS.OTP);
      setResendTimer(60); 
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return toast.error('Enter the complete 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: otpValue });
      toast.success('OTP verified! ✅');
      setStep(STEPS.PASSWORD);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const otpValue = otp.join('');
      const { data } = await api.post('/auth/reset-password', {
        email, otp: otpValue, newPassword
      });
      
      localStorage.setItem('token', data.token);
      toast.success('Password reset! Logging you in... 🎉');
      setStep(STEPS.SUCCESS);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = ['', 'Enter Email', 'Verify OTP', 'New Password', 'Done'];

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, margin: '0 auto', padding: '20px' }}>
        <div className="auth-card" style={{ maxWidth: '100%' }}>

          {}
          <div className="auth-logo">
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">SkillSync</span>
          </div>

          {}
          <div className="fp-steps">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`fp-step ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                {s < 3 && <div className={`fp-line ${step > s ? 'active' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          {}
          {step === STEPS.EMAIL && (
            <>
              <h1 className="auth-title">Forgot Password?</h1>
              <p className="auth-subtitle">Enter your college email and we'll send a 6-digit OTP</p>
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label className="form-label">Registered Email</label>
                  <div className="input-icon-wrap">
                    <Mail size={16} className="input-icon" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="form-input input-with-icon"
                      placeholder="you@college.ac.in" required autoFocus />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP...</> : <><Mail size={15} /> Send OTP to Email</>}
                </button>
              </form>
            </>
          )}

          {}
          {step === STEPS.OTP && (
            <>
              <h1 className="auth-title">Enter OTP</h1>
              <p className="auth-subtitle">
                6-digit code sent to <strong style={{ color: 'var(--accent)' }}>{email.replace(/(.{2}).*(@.*)/, '$1***$2')}</strong>
              </p>
              <form onSubmit={handleVerifyOTP}>
                <div className="otp-grid" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`otp-box ${digit ? 'filled' : ''}`}
                    />
                  ))}
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.join('').length !== 6}>
                  {loading ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</> : <><KeyRound size={15} /> Verify OTP</>}
                </button>

                <div className="fp-resend">
                  {resendTimer > 0
                    ? <span>Resend OTP in <strong style={{ color: 'var(--accent)' }}>{resendTimer}s</strong></span>
                    : <button type="button" className="btn btn-ghost btn-sm" onClick={handleResendOTP} disabled={loading}>
                        Resend OTP
                      </button>
                  }
                </div>
              </form>
            </>
          )}

          {}
          {step === STEPS.PASSWORD && (
            <>
              <h1 className="auth-title">New Password</h1>
              <p className="auth-subtitle">Choose a strong password for your account</p>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} className="input-icon" />
                    <input type="password" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="form-input input-with-icon"
                      placeholder="At least 6 characters" required minLength={6} autoFocus />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-icon-wrap">
                    <Lock size={16} className="input-icon" />
                    <input type="password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="form-input input-with-icon"
                      placeholder="Repeat password" required />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>Passwords do not match</p>
                  )}
                </div>

                {}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: newPassword.length >= i * 2
                          ? i <= 1 ? 'var(--danger)' : i === 2 ? 'var(--warning)' : i === 3 ? 'var(--accent)' : 'var(--success)'
                          : 'var(--border)'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {newPassword.length === 0 ? '' :
                     newPassword.length < 4 ? '⚠️ Too weak' :
                     newPassword.length < 6 ? '⚠️ Weak' :
                     newPassword.length < 8 ? '✓ Okay' : '✓ Strong'}
                  </span>
                </div>

                <button type="submit" className="btn btn-primary btn-full"
                  disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}>
                  {loading ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</> : <><Lock size={15} /> Reset Password</>}
                </button>
              </form>
            </>
          )}

          {}
          {step === STEPS.SUCCESS && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h1 className="auth-title">Password Reset!</h1>
              <p className="auth-subtitle">You're being logged in automatically...</p>
              <div className="spinner" style={{ margin: '20px auto' }} />
            </div>
          )}

          {}
          {step !== STEPS.SUCCESS && (
            <p className="auth-link" style={{ marginTop: 20 }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
