import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users');
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      
      // Filter out admin users and only show non-admin users
      const nonAdminUsers = data.data.filter(user => user.role !== 'admin');
      setUsers(nonAdminUsers);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-2xl">Error: {error}</div>
        <button
          onClick={fetchUsers}
          className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-black to-transparent p-6 fixed w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-red-600 text-3xl font-bold">CineStream</h1>
          <nav className="flex gap-6">
            <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <Link to="/movies" className="hover:text-gray-300 transition-colors">Movies</Link>
            <Link to="/users" className="text-white font-semibold">Users</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Community Members</h1>
            <p className="text-gray-400 text-lg">
              Discover other movie enthusiasts and their reviews
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Users Grid */}
          <section>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">
                  {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-red-600 hover:text-red-500 font-semibold"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    All Users ({filteredUsers.length})
                  </h2>
                  <div className="text-gray-400 text-sm">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group"
                    >
                      {/* User Avatar */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-700 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                          {user.name?.charAt(0) || user.username?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">
                            {user.name}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white truncate ml-2 max-w-[150px]">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Age:</span>
                          <span className="text-white">{user.age} years</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Role:</span>
                          <span className="text-white capitalize">{user.role}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Status:</span>
                          <span className={`font-medium ${user.isVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Member Since */}
                      <div className="text-xs text-gray-500 mb-4 border-t border-gray-700 pt-3">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </div>

                      {/* View Details Button */}
                      <Link
                        to={`/user/${user._id}`}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group/btn"
                      >
                        View Profile
                        <svg
                          className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Netflix-style Users Directory • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default UsersList;