import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Star, 
  Clock, 
  Play, 
  X, 
  Filter, 
  Calendar,
  User,
  ThumbsUp,
  Film,
  LogOut,
  Heart
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const MovieListUser = ({ userId }) => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    director: '',
    minRating: 0,
    duration: ''
  });
  const { id } = useParams();
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [favorites, setFavorites] = useState([]);

  const navigate = useNavigate();

  // Fetch all movies
  useEffect(() => {
    fetchMovies();
    fetchFavorites();
  }, []);

  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/movies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
        setFilteredMovies(data);
      } else {
        toast.error('Failed to fetch movies');
      }
    } catch (error) {
      toast.error('Network error while fetching movies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user favorites
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
    toast.info('Logged out successfully');
  };

  // Filter movies based on search and filters
  useEffect(() => {
    let filtered = movies;

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre?.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.genre) {
      filtered = filtered.filter(movie => movie.genre?.includes(filters.genre));
    }

    if (filters.director) {
      filtered = filtered.filter(movie => 
        movie.director?.toLowerCase().includes(filters.director.toLowerCase())
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(movie => movie.ratingAverage >= filters.minRating);
    }

    if (filters.duration) {
      filtered = filtered.filter(movie => movie.duration <= parseInt(filters.duration));
    }

    setFilteredMovies(filtered);
  }, [movies, searchTerm, filters]);

  // Fetch movie details
  const fetchMovieDetails = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setSelectedMovie(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      toast.error('Error fetching movie details');
    }
  };

  // Add review using the new API
  const addReview = async (movieId) => {
    if (!newReview.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Review added successfully!');
        await fetchMovieDetails(movieId); // Refresh movie details to show the new review
        setNewReview({ rating: 5, comment: '' });
      } else {
        toast.error(data.message || 'Failed to add review');
      }
    } catch (error) {
      toast.error('Error adding review');
    }
  };

  // Toggle favorite
  const toggleFavorite = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
        toast.success(data.message || 'Favorite updated');
      } else {
        toast.error('Failed to update favorites');
      }
    } catch (error) {
      toast.error('Error updating favorites');
    }
  };

  // Check if movie is favorite
  const isFavorite = (movieId) => {
    return favorites.includes(movieId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/user')}
              whileHover={{ scale: 1.05 }}
            >
              <Film className="text-red-500" size={32} />
              <span className="text-white text-xl font-bold">CineStream</span>
            </motion.div>

            {/* Navigation Links - Only Profile for user */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/user/${userId}`)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                <User size={18} />
                My Profile
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={18} />
              Logout
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/user/${userId}`)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex-1 min-w-[120px] justify-center"
              >
                <User size={16} />
                My Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to CineStream</h1>
          <p className="text-gray-400">Discover and watch amazing movies</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search movies by title, genre, or director..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Filter Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-black bg-opacity-50 backdrop-blur-lg rounded-lg mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Filter size={24} />
            <h2 className="text-xl font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            >
              <option value="">All Genres</option>
              {[...new Set(movies.flatMap(movie => movie.genre || []))].map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Director name"
              value={filters.director}
              onChange={(e) => setFilters({ ...filters, director: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            />

            <select
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseInt(e.target.value) })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            >
              <option value={0}>Any Rating</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
            </select>

            <select
              value={filters.duration}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            >
              <option value="">Any Duration</option>
              <option value="120">Under 2 hours</option>
              <option value="90">Under 1.5 hours</option>
              <option value="60">Under 1 hour</option>
            </select>
          </div>
        </motion.section>

        {/* Movies Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            {searchTerm || Object.values(filters).some(f => f) ? 'Search Results' : 'Featured Movies'}
            <span className="text-gray-400 ml-2">({filteredMovies.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group cursor-pointer relative"
                onClick={() => fetchMovieDetails(movie._id)}
              >
                {/* Favorite Button */}
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(movie._id);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite(movie._id) 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <Heart 
                      size={16} 
                      className={isFavorite(movie._id) ? 'fill-white text-white' : 'text-white'}
                    />
                  </motion.button>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-2xl">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400/1f2937/6b7280?text=No+Image';
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-lg mb-1 text-white">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Star className="text-yellow-400" size={16} />
                      <span>{(movie.ratingAverage || movie.rating || 0).toFixed(1)}</span>
                      <Clock size={16} />
                      <span>{Math.floor((movie.duration || 0) / 60)}h {(movie.duration || 0) % 60}m</span>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="bg-red-600 rounded-full p-3">
                      <Play size={24} fill="white" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <p className="text-xl">No movies found matching your criteria.</p>
            </motion.div>
          )}
        </motion.section>
      </div>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-95 backdrop-blur-lg"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Movie Header */}
              <div className="relative h-80 lg:h-96">
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400/1f2937/6b7280?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(selectedMovie._id);
                    }}
                    className={`rounded-full p-3 transition-all shadow-lg ${
                      isFavorite(selectedMovie._id)
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <Heart 
                      size={20} 
                      className={isFavorite(selectedMovie._id) ? 'fill-white text-white' : 'text-white'}
                    />
                  </button>
                  <button
                    onClick={() => setSelectedMovie(null)}
                    className="bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-90 transition-all shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl lg:text-5xl font-bold mb-3 text-white drop-shadow-2xl">
                    {selectedMovie.title}
                  </h1>
                  <div className="flex items-center gap-6 text-lg">
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Star className="text-yellow-400" size={24} />
                      <span className="font-semibold text-white">
                        {(selectedMovie.ratingAverage || selectedMovie.rating || 0).toFixed(1)}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Clock size={20} />
                      <span>{Math.floor((selectedMovie.duration || 0) / 60)}h {(selectedMovie.duration || 0) % 60}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar size={20} />
                      <span>{selectedMovie.releaseDate ? new Date(selectedMovie.releaseDate).getFullYear() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Movie Details */}
              <div className="p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
                      <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
                      <p className="text-gray-200 text-lg leading-relaxed">
                        {selectedMovie.description || 'No description available.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <h3 className="font-semibold text-gray-300 mb-3 text-lg">Director</h3>
                        <p className="text-white text-xl">{selectedMovie.director || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <h3 className="font-semibold text-gray-300 mb-3 text-lg">Cast</h3>
                        <p className="text-white text-lg">{selectedMovie.actors?.join(', ') || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <h3 className="font-semibold text-gray-300 mb-3 text-lg">Genre</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedMovie.genre?.map(g => (
                            <span key={g} className="bg-red-600 px-3 py-1 rounded-full text-sm font-medium text-white">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                        <h3 className="font-semibold text-gray-300 mb-3 text-lg">Language</h3>
                        <p className="text-white text-xl">{selectedMovie.language || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <ThumbsUp size={28} className="text-red-400" />
                        Reviews ({(selectedMovie.reviews || []).length})
                      </h3>

                      {/* Add Review */}
                      <div className="bg-gray-700/50 rounded-xl p-5 mb-6 border border-gray-600">
                        <h4 className="font-semibold text-white mb-4 text-lg">Add Your Review</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-300">Rating:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  size={28}
                                  className={`cursor-pointer transition-transform hover:scale-110 ${
                                    star <= newReview.rating 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-500 hover:text-yellow-300'
                                  }`}
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                />
                              ))}
                            </div>
                            <span className="text-yellow-400 font-semibold ml-2">
                              {newReview.rating}/5
                            </span>
                          </div>
                          <textarea
                            placeholder="Share your thoughts about this movie..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="w-full bg-gray-600 border border-gray-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-lg"
                            rows="4"
                          />
                          <button
                            onClick={() => addReview(selectedMovie._id)}
                            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-lg font-semibold text-white shadow-lg hover:shadow-red-500/25"
                          >
                            <ThumbsUp size={20} />
                            Submit Review
                          </button>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {(selectedMovie.reviews || []).map((review, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-700/30 rounded-xl p-5 border border-gray-600"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-red-500/20 p-2 rounded-full">
                                  <User size={20} className="text-red-400" />
                                </div>
                                <span className="font-semibold text-white text-lg">
                                  {review.userId === userId ? 'You' : `User ${review.userId?.slice(-6) || 'Anonymous'}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                                <Star className="text-yellow-400" size={18} />
                                <span className="font-semibold text-white">{review.rating}.0/5</span>
                              </div>
                            </div>
                            <p className="text-gray-200 text-lg mb-2">{review.comment}</p>
                            <p className="text-gray-400 text-sm">
                              {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Recently'}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 text-lg shadow-lg hover:shadow-red-500/25"
                      onClick={() => window.open(selectedMovie.trailerUrl, "_blank")}
                    >
                      <Play size={24} fill="white" />
                      Watch Trailer
                    </motion.button>

                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <h4 className="font-semibold text-white mb-4 text-xl flex items-center gap-2">
                        <Film size={24} className="text-red-400" />
                        Movie Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-600">
                          <span className="text-gray-300 font-medium">Theme:</span>
                          <span className="text-white font-semibold">{selectedMovie.theme || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-600">
                          <span className="text-gray-300 font-medium">Release Date:</span>
                          <span className="text-white font-semibold">
                            {selectedMovie.releaseDate 
                              ? new Date(selectedMovie.releaseDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-600">
                          <span className="text-gray-300 font-medium">Duration:</span>
                          <span className="text-white font-semibold">
                            {Math.floor((selectedMovie.duration || 0) / 60)}h {(selectedMovie.duration || 0) % 60}m
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-300 font-medium">Overall Rating:</span>
                          <div className="flex items-center gap-2">
                            <Star className="text-yellow-400" size={20} />
                            <span className="text-white font-semibold">
                              {(selectedMovie.ratingAverage || selectedMovie.rating || 0).toFixed(1)}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieListUser;