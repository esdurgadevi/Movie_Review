import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaUserShield, 
  FaUser, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSort,
  FaEye
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and search users
  useEffect(() => {
    let result = users;

    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(lowercasedSearch) ||
        user.email.toLowerCase().includes(lowercasedSearch) ||
        user.name.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply verification filter
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'verified';
      result = result.filter(user => user.isVerified === isVerified);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, verificationFilter]);

  // Sort users
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(sortedUsers);
  };

  // Delete user
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Toggle user verification
  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to update user verification');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-gray-400">Manage all registered users in the system</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
            <p className="text-gray-400">Total Users</p>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-lg p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>

          {/* Verification Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center justify-center"
          >
            Refresh Users
          </button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-gray-300">
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-600 transition duration-200"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-2">
                    <span>User</span>
                    <FaSort className="text-sm" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Contact</th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-600 transition duration-200"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Role</span>
                    <FaSort className="text-sm" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-600 transition duration-200"
                  onClick={() => handleSort('isVerified')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Status</span>
                    <FaSort className="text-sm" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-600 transition duration-200"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Joined</span>
                    <FaSort className="text-sm" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    <FaUsers className="text-4xl mx-auto mb-4 opacity-50" />
                    <p className="text-xl">No users found</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-750 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {user.role === 'admin' ? (
                            <FaUserShield className="text-white text-sm" />
                          ) : (
                            <FaUser className="text-white text-sm" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{user.email}</p>
                      <p className="text-gray-400 text-sm">Age: {user.age}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'admin' ? (
                          <>
                            <FaUserShield className="mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <FaUser className="mr-1" />
                            User
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user.isVerified ? (
                          <>
                            <FaCheckCircle className="text-green-500" />
                            <span className="text-green-400">Verified</span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="text-red-500" />
                            <span className="text-red-400">Unverified</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{formatDate(user.createdAt)}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleVerification(user._id, user.isVerified)}
                          className={`p-2 rounded-lg transition duration-200 ${
                            user.isVerified 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title={user.isVerified ? 'Unverify User' : 'Verify User'}
                        >
                          {user.isVerified ? (
                            <FaTimesCircle className="text-white" />
                          ) : (
                            <FaCheckCircle className="text-white" />
                          )}
                        </button>
                        
                        <button
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200"
                          title="View Details"
                        >
                          <FaEye className="text-white" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user._id, user.username)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition duration-200"
                          title="Delete User"
                        >
                          <FaTrash className="text-white" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6"
      >
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <FaUsers className="text-purple-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => user.role === 'admin').length}
              </p>
            </div>
            <FaUserShield className="text-red-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Verified Users</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => user.isVerified).length}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Unverified</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => !user.isVerified).length}
              </p>
            </div>
            <FaTimesCircle className="text-yellow-500 text-2xl" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Users;