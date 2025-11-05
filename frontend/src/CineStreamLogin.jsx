import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Mail, 
  Calendar,
  Eye, 
  EyeOff,
  Film,
  Shield
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MovieListUser from './MovieListUser';
import MovieListAdmin from './MovieListAdmin';

// Utility function to decode JWT token
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const CineStreamLogin = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginType, setLoginType] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
    age: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle login - UPDATED
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
          password: formData.password,
          role: loginType
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Welcome back, ${loginType === 'admin' ? 'Admin' : 'User'}!`);
        
        // Decode token to get userId
        const decodedToken = decodeJWT(data.token);
        const userId = decodedToken?.userId;
        
        if (!userId) {
          toast.error('Unable to get user information');
          return;
        }

        console.log('Login successful - User ID:', userId, 'Role:', data.role);
        
        // Store user data
        setUserRole(data.role);
        setUserId(userId);
        setIsLoggedIn(true);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', userId);
        
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
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
          age: parseInt(formData.age),
          role: 'user'
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

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    toast.info('Logged out successfully');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Check if user is already logged in on component mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    
    if (token && storedUserRole && storedUserId) {
      setIsLoggedIn(true);
      setUserRole(storedUserRole);
      setUserId(storedUserId);
    }
  }, []);

  // If user is logged in, render the appropriate component
  if (isLoggedIn && userRole && userId) {
    console.log('Rendering dashboard - User ID:', userId, 'Role:', userRole);
    
    return (
      <div className="min-h-screen bg-gray-900">
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
        
        {/* Logout Button */}
        <div className="fixed top-4 right-4 z-50">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg"
          >
            <User size={16} />
            Logout ({userRole})
          </motion.button>
        </div>

        {/* Render appropriate component based on role */}
        {userRole === 'admin' ? (
          <MovieListAdmin userId={userId} />
        ) : (
          <MovieListUser userId={userId} />
        )}
      </div>
    );
  }

  // Login/Register UI (same as before)
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
        className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10">
            <motion.h1 
              className="text-3xl font-bold text-white flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Film size={32} />
              CineStream
            </motion.h1>
            <p className="text-gray-200 mt-2 opacity-90">Your Ultimate Movie Destination</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-900 bg-opacity-50">
          <button
            className={`flex-1 py-4 font-medium transition-all ${
              activeTab === 'login' 
                ? 'text-red-400 border-b-2 border-red-400 bg-red-500 bg-opacity-10' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 font-medium transition-all ${
              activeTab === 'register' 
                ? 'text-red-400 border-b-2 border-red-400 bg-red-500 bg-opacity-10' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
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
                <div className="flex mb-6 bg-gray-700 rounded-lg p-1 border border-gray-600">
                  <button
                    className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${
                      loginType === 'user' 
                        ? 'bg-red-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setLoginType('user')}
                  >
                    <User size={16} />
                    User
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${
                      loginType === 'admin' 
                        ? 'bg-red-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setLoginType('admin')}
                  >
                    <Shield size={16} />
                    Admin
                  </button>
                </div>
                
                {/* Login Form */}
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-red-400 transition-colors"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff size={18} className="text-gray-400" />
                        ) : (
                          <Eye size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <User size={18} />
                        Login as {loginType === 'admin' ? 'Admin' : 'User'}
                      </>
                    )}
                  </motion.button>
                </form>
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
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Age</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        placeholder="Enter your age"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-red-400 transition-colors"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff size={18} className="text-gray-400" />
                        ) : (
                          <Eye size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <User size={18} />
                        Create Account
                      </>
                    )}
                  </motion.button>
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
                <p className="text-gray-300 text-center mb-6 text-sm">
                  We've sent a verification code to <br />
                  <span className="text-red-400 font-medium">{formData.email}</span>
                </p>
                
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">Enter OTP Code</label>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-center text-xl tracking-widest font-mono"
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      'Verify OTP'
                    )}
                  </motion.button>
                  
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-all border border-gray-600"
                  >
                    Back to Registration
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-900 bg-opacity-50 p-4 text-center text-gray-400 text-sm border-t border-gray-700">
          © 2024 CineStream. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default CineStreamLogin;