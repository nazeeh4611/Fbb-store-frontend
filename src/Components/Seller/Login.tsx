import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import api from '../../lib/api';
interface LoginFormData {
  emailOrPhone: string;
  password: string;
}


const SellerLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isEmail, setIsEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: ''
  });


  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        console.log(formData,"kkkk")
      const response = await api.post("/seller/login", formData);
      localStorage.setItem('sellerToken', response.data.token);
      toast.success('Login successful');
      setTimeout(() => {
        navigate('/seller/product');
      }, 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'emailOrPhone') {
      setIsEmail(value.includes('@'));
    }
  };

  return (
    <div className="min-h-screen w-full bg-canvas flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-md shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ink">FBB STORE</h1>
          <h2 className="mt-6 text-2xl font-semibold text-ink">Seller Login</h2>
          <p className="mt-2 text-ink-soft">Please sign in to your seller account</p>
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
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg  text-sm font-medium text-white bg-ink hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <a href="mailto:fbbstore1@gmail.com?subject=Seller%20password%20reset" className="text-sm text-ink hover:text-ink">Forgot your password?
            </a>
           <Link to="/seller/register"> Create an account</Link>
             
          
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;