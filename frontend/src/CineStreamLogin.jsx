import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope, FaGoogle, FaEye, FaEyeSlash, FaCalendarAlt, FaUserTag } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CineStreamLogin = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginType, setLoginType] = useState('user');
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    
    // Registration fields
    username: '',
    name: '',
    age: '',
    
    // OTP verification
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Welcome back, ${loginType === 'admin' ? 'Admin' : 'User'}!`);
        // Store token and redirect to movie list
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', loginType);
        setTimeout(() => {
          window.location.href = '/movielist';
        }, 1500);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          age: parseInt(formData.age)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Registration successful! Please verify your email with OTP.');
        setOtpSent(true);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Email verified successfully! You can now login.');
        setOtpSent(false);
        setActiveTab('login');
        // Reset form
        setFormData({
          email: '', password: '', username: '', name: '', age: '', otp: ''
        });
      } else {
        toast.error(data.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    // This would typically integrate with Google OAuth
    // For now, we'll show a message
    toast.info('Google login would be implemented with OAuth');
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">CineStream</h1>
          <p className="text-gray-200 mt-2">Your Ultimate Movie Review Destination</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-4 font-medium ${activeTab === 'login' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 font-medium ${activeTab === 'register' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'login' && !otpSent && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Login Type Selector */}
                <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
                  <button
                    className={`flex-1 py-2 rounded-md flex items-center justify-center ${loginType === 'user' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
                    onClick={() => setLoginType('user')}
                  >
                    <FaUser className="mr-2" />
                    User Login
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md flex items-center justify-center ${loginType === 'admin' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
                    onClick={() => setLoginType('admin')}
                  >
                    <FaUserTag className="mr-2" />
                    Admin Login
                  </button>
                </div>
                
                {/* Login Form */}
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="text-gray-400" />
                        ) : (
                          <FaEye className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      `Login as ${loginType === 'admin' ? 'Admin' : 'User'}`
                    )}
                  </button>
                </form>
                
                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-600"></div>
                  <div className="px-3 text-gray-400">or</div>
                  <div className="flex-1 border-t border-gray-600"></div>
                </div>
                
                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 py-2 rounded-lg font-medium transition duration-300 flex items-center justify-center"
                >
                  <FaGoogle className="text-red-500 mr-2" />
                  Continue with Google
                </button>
              </motion.div>
            )}
            
            {activeTab === 'register' && !otpSent && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-white mb-6 text-center">Create Your Account</h3>
                
                {/* Registration Form */}
                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Age</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your age"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="text-gray-400" />
                        ) : (
                          <FaEye className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
            
            {otpSent && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-white mb-2 text-center">Verify Your Email</h3>
                <p className="text-gray-300 text-center mb-6">
                  We've sent a verification code to {formData.email}
                </p>
                
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xl tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition duration-300 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition duration-300"
                  >
                    Back to Registration
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-900 p-4 text-center text-gray-400 text-sm">
          © 2023 CineStream. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default CineStreamLogin;