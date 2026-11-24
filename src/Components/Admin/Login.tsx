import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import api, { errorMessage } from '../../lib/api';
interface LoginFormData {
  emailOrPhone: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    email: string;
    phone: string;
    _id: string;
  };
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isEmail, setIsEmail] = useState(true);
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: ''
  });


  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<LoginResponse>("/admin/login", formData);
      
      // Store token in localStorage
      localStorage.setItem('adminToken', response.data.token);
      
      // Show success toast
      toast.success('Login successful');
      
      // Navigate to products page after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
      
    } catch (error) {
      // Show error toast
      toast.error(errorMessage(error, 'Login failed. Please check your credentials.'));
      console.error('Login error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Detect if input is email or phone
    if (name === 'emailOrPhone') {
      setIsEmail(value.includes('@'));
    }
  };

  return (
    <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-md shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ink">FBB STORE</h1>
          <h2 className="mt-6 text-2xl font-semibold text-ink">Admin Login</h2>
          <p className="mt-2 text-ink-soft">Please sign in to your admin account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-ink-soft mb-1">
                Email or Phone Number
              </label>
              <div className="relative">
                {isEmail ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
                )}
                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type={isEmail ? "email" : "tel"}
                  required
                  className="pl-10 w-full rounded-lg border border-line bg-white py-2 px-3 text-sm placeholder-muted  focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  placeholder={isEmail ? "Enter your email" : "Enter your phone number"}
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  pattern={isEmail ? undefined : "[0-9]{10,}"}
                  title={isEmail ? undefined : "Please enter a valid phone number (minimum 10 digits)"}
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-ink-soft mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="pl-10 w-full rounded-lg border border-line bg-white py-2 px-3 text-sm placeholder-muted  focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-soft"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg  text-sm font-medium text-white bg-ink hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <a href="#" className="text-sm text-ink hover:text-ink">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;