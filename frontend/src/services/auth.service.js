const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const AuthService = {
  validateAlumniCode: async (code) => {
    const res = await fetch(`${API_URL}/auth/alumni/validate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Invalid code');
    }
    return await res.json();
  },

  sendAlumniOtp: async (email, code_id) => {
    const res = await fetch(`${API_URL}/auth/alumni/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code_id })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to send OTP');
    }
    return await res.json();
  },

  verifyAlumniOtp: async (email, otp) => {
    const res = await fetch(`${API_URL}/auth/alumni/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Invalid OTP');
    }
    return await res.json();
  },

  registerAlumni: async (data) => {
    const res = await fetch(`${API_URL}/auth/alumni/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }
    return await res.json();
  }
};

export default AuthService;
