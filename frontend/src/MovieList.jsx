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
  Edit3,
  Trash2,
  Plus,
  Save,
  Film
} from 'lucide-react';
import { useParams } from 'react-router-dom';

// MovieList Component
const MovieList = () => {
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
  const {id} = useParams();
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingMovie, setEditingMovie] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    director: '',
    description: '',
    duration: '',
    genre: [],
    actors: [],
    language: '',
    theme: '',
    releaseDate: '',
    posterUrl: '',
    trailerUrl: ''
  });

  // Fetch all movies
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/movies');
      const data = await response.json();
      setMovies(data);
      setFilteredMovies(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  };

  // Filter movies based on search and filters
  useEffect(() => {
    let filtered = movies;

    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.genre) {
      filtered = filtered.filter(movie => movie.genre.includes(filters.genre));
    }

    if (filters.director) {
      filtered = filtered.filter(movie => 
        movie.director.toLowerCase().includes(filters.director.toLowerCase())
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
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}`);
      const data = await response.json();
      setSelectedMovie(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  // Add review
 const addReview = async (movieId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movie_id: movieId,
        rating: newReview.rating,
        comment: newReview.comment,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Review added successfully:', data);
      await fetchMovieDetails(movieId);
      setNewReview({ rating: 5, comment: '' });
    } else {
      console.error('Failed to add review:', data.message);
    }
  } catch (error) {
    console.error('Error adding review:', error);
  }
};


  // Delete movie
  const deleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove movie from local state
        setMovies(movies.filter(movie => movie._id !== movieId));
        setFilteredMovies(filteredMovies.filter(movie => movie._id !== movieId));
        
        // Close modal if the deleted movie was selected
        if (selectedMovie && selectedMovie._id === movieId) {
          setSelectedMovie(null);
        }
        
        alert('Movie deleted successfully!');
      } else {
        alert('Failed to delete movie');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error deleting movie');
    }
  };

  // Start editing movie
  const startEditing = (movie) => {
    setEditingMovie(movie._id);
    setEditForm({
      title: movie.title,
      director: movie.director,
      description: movie.description,
      duration: movie.duration.toString(),
      genre: [...movie.genre],
      actors: [...movie.actors],
      language: movie.language,
      theme: movie.theme,
      releaseDate: movie.releaseDate.split('T')[0],
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMovie(null);
    setEditForm({
      title: '',
      director: '',
      description: '',
      duration: '',
      genre: [],
      actors: [],
      language: '',
      theme: '',
      releaseDate: '',
      posterUrl: '',
      trailerUrl: ''
    });
  };

  // Update edit form
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array fields (genre, actors)
  const handleArrayFieldChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setEditForm(prev => ({
      ...prev,
      [field]: array
    }));
  };

  // Save edited movie
  const saveMovie = async (movieId) => {
    try {
      const movieData = {
        ...editForm,
        duration: parseInt(editForm.duration),
        releaseDate: new Date(editForm.releaseDate).toISOString()
      };

      const response = await fetch(`http://localhost:5000/api/movies/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });
      
      if (response.ok) {
        const updatedMovie = await response.json();
        
        // Update local state
        setMovies(movies.map(movie => 
          movie._id === movieId ? updatedMovie : movie
        ));
        
        // Update filtered movies
        setFilteredMovies(filteredMovies.map(movie => 
          movie._id === movieId ? updatedMovie : movie
        ));
        
        // Update selected movie if it's the one being edited
        if (selectedMovie && selectedMovie._id === movieId) {
          setSelectedMovie(updatedMovie);
        }
        
        setEditingMovie(null);
        alert('Movie updated successfully!');
      } else {
        alert('Failed to update movie');
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Error updating movie');
    }
  };

  // Filter functions
  const fetchHighRatingMovies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/movies/high-rating/top');
      const data = await response.json();
      setFilteredMovies(data);
    } catch (error) {
      console.error('Error fetching high rating movies:', error);
    }
  };

  const fetchByDirector = async (director) => {
    try {
      const response = await fetch(`http://localhost:5000/api/movies/director/${director}`);
      const data = await response.json();
      setFilteredMovies(data);
    } catch (error) {
      console.error('Error fetching movies by director:', error);
    }
  };

  const fetchByGenre = async (genre) => {
    try {
      const response = await fetch(`http://localhost:5000/api/movies/genre/${genre}`);
      const data = await response.json();
      setFilteredMovies(data);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
    }
  };

  const fetchByDuration = async (duration) => {
    try {
      const response = await fetch(`http://localhost:5000/api/movies/duration/${duration}`);
      const data = await response.json();
      setFilteredMovies(data);
    } catch (error) {
      console.error('Error fetching movies by duration:', error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-gradient-to-b from-black to-transparent p-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Film size={32} />
            CineStream
          </motion.h1>
          
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search movies, directors, genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-full py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>
        </div>
      </motion.header>

      {/* Filter Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-black bg-opacity-50 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto">
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
              {[...new Set(movies.flatMap(movie => movie.genre))].map(genre => (
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

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchHighRatingMovies}
              className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Star size={16} />
              Top Rated
            </motion.button>
            
            {['Action', 'Drama', 'Comedy', 'Thriller'].map(genre => (
              <motion.button
                key={genre}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchByGenre(genre)}
                className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {genre}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Movie Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6"
      >
        <div className="max-w-7xl mx-auto">
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
                {/* Edit and Delete Buttons */}
                <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(movie);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  >
                    <Edit3 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMovie(movie._id);
                    }}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>

                <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-2xl">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Star className="text-yellow-400" size={16} />
                      <span>{movie.ratingAverage.toFixed(1)}</span>
                      <Clock size={16} />
                      <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
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
        </div>
      </motion.section>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 backdrop-blur-lg"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Movie Header */}
              <div className="relative h-96">
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(selectedMovie);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-all"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMovie(selectedMovie._id);
                    }}
                    className="bg-red-600 hover:bg-red-700 rounded-full p-2 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedMovie(null)}
                    className="bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="absolute bottom-6 left-6">
                  <h1 className="text-4xl font-bold mb-2">{selectedMovie.title}</h1>
                  <div className="flex items-center gap-4 text-lg">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={20} />
                      <span>{selectedMovie.ratingAverage.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={20} />
                      <span>{Math.floor(selectedMovie.duration / 60)}h {selectedMovie.duration % 60}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={20} />
                      <span>{new Date(selectedMovie.releaseDate).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Movie Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <p className="text-gray-300 mb-4">{selectedMovie.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-400">Director</h3>
                        <p>{selectedMovie.director}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-400">Cast</h3>
                        <p>{selectedMovie.actors.join(', ')}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-400">Genre</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedMovie.genre.map(g => (
                            <span key={g} className="bg-red-600 px-2 py-1 rounded text-sm">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-400">Language</h3>
                        <p>{selectedMovie.language}</p>
                      </div>
                    </div>

                    {/* Reviews Section */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ThumbsUp size={24} />
                        Reviews ({selectedMovie.reviews.length})
                      </h3>

                      {/* Add Review */}
                      <div className="bg-gray-800 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-3">Add Your Review</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span>Rating:</span>
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={20}
                                className={`cursor-pointer ${
                                  star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                                }`}
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                              />
                            ))}
                          </div>
                          <textarea
                            placeholder="Write your review..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                            rows="3"
                          />
                          <button
                            onClick={() => addReview(selectedMovie._id)}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Submit Review
                          </button>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {selectedMovie.reviews.map((review, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-800 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400" />
                                <span className="font-semibold">User {review.userId?.slice(-6)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="text-yellow-400" size={16} />
                                <span>{review.rating}.0</span>
                              </div>
                            </div>
                            <p className="text-gray-300">{review.comment}</p>
                            <p className="text-gray-500 text-sm mt-2">
                              {new Date(review.reviewedAt).toLocaleDateString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      onClick={()=>window.open(selectedMovie.trailerUrl,"_blank")}
                    >
                      <Play size={20} />
                      Watch Trailer
                    </motion.button>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Movie Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Theme:</span>
                          <span>{selectedMovie.theme}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Release Date:</span>
                          <span>{new Date(selectedMovie.releaseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span>{Math.floor(selectedMovie.duration / 60)}h {selectedMovie.duration % 60}m</span>
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

      {/* Edit Movie Modal */}
      <AnimatePresence>
        {editingMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 backdrop-blur-lg"
            onClick={cancelEditing}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Edit Movie</h2>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Director</label>
                    <input
                      type="text"
                      value={editForm.director}
                      onChange={(e) => handleEditChange('director', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) => handleEditChange('duration', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Release Date</label>
                    <input
                      type="date"
                      value={editForm.releaseDate}
                      onChange={(e) => handleEditChange('releaseDate', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Genre (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.genre.join(', ')}
                      onChange={(e) => handleArrayFieldChange('genre', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                      placeholder="Action, Drama, Thriller"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Actors (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.actors.join(', ')}
                      onChange={(e) => handleArrayFieldChange('actors', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                      placeholder="Actor 1, Actor 2, Actor 3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Language</label>
                    <input
                      type="text"
                      value={editForm.language}
                      onChange={(e) => handleEditChange('language', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Theme</label>
                    <input
                      type="text"
                      value={editForm.theme}
                      onChange={(e) => handleEditChange('theme', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Poster URL</label>
                    <input
                      type="url"
                      value={editForm.posterUrl}
                      onChange={(e) => handleEditChange('posterUrl', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Trailer URL</label>
                    <input
                      type="url"
                      value={editForm.trailerUrl}
                      onChange={(e) => handleEditChange('trailerUrl', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => saveMovie(editingMovie)}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save size={20} />
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelEditing}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieList;