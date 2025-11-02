import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  Film, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Globe, 
  Tag,
  Star,
  X,
  Check
} from 'lucide-react';

const CreateMovie = ({ onMovieCreated, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseDate: '',
    posterUrl: '',
    trailerUrl: '',
    language: '',
    genre: [],
    theme: '',
    actors: [],
    director: '',
    duration: ''
  });

  const [currentActor, setCurrentActor] = useState('');
  const [currentGenre, setCurrentGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Genre options
  const genreOptions = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Crime', 'Animation',
    'Documentary', 'Family', 'Musical', 'Western', 'Biography', 'History'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addActor = () => {
    if (currentActor.trim() && !formData.actors.includes(currentActor.trim())) {
      setFormData(prev => ({
        ...prev,
        actors: [...prev.actors, currentActor.trim()]
      }));
      setCurrentActor('');
    }
  };

  const removeActor = (actorToRemove) => {
    setFormData(prev => ({
      ...prev,
      actors: prev.actors.filter(actor => actor !== actorToRemove)
    }));
  };

  const addGenre = (genre) => {
    if (!formData.genre.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        genre: [...prev.genre, genre]
      }));
    }
  };

  const removeGenre = (genreToRemove) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.filter(genre => genre !== genreToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const movieData = {
        ...formData,
        duration: parseInt(formData.duration),
        releaseDate: new Date(formData.releaseDate).toISOString()
      };

      const response = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onMovieCreated) onMovieCreated();
          if (onClose) onClose();
          // Reset form
          setFormData({
            title: '',
            description: '',
            releaseDate: '',
            posterUrl: '',
            trailerUrl: '',
            language: '',
            genre: [],
            theme: '',
            actors: [],
            director: '',
            duration: ''
          });
        }, 2000);
      } else {
        throw new Error('Failed to create movie');
      }
    } catch (error) {
      console.error('Error creating movie:', error);
      alert('Error creating movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-900 to-black p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Movie
                </h2>
                <p className="text-gray-400">Fill in the movie details below</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="m-4 p-4 bg-green-600 bg-opacity-20 border border-green-500 rounded-lg flex items-center gap-3"
          >
            <Check size={20} className="text-green-400" />
            <span className="text-green-400">Movie created successfully!</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Film size={16} />
                  Movie Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter movie title"
                />
              </motion.div>

              {/* Director */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <User size={16} />
                  Director *
                </label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter director's name"
                />
              </motion.div>

              {/* Duration */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Clock size={16} />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter duration in minutes"
                />
              </motion.div>

              {/* Release Date */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Calendar size={16} />
                  Release Date *
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </motion.div>

              {/* Language */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Globe size={16} />
                  Language *
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter language"
                />
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Poster URL */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Upload size={16} />
                  Poster Image URL *
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="https://example.com/poster.jpg"
                />
              </motion.div>

              {/* Trailer URL */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Film size={16} />
                  Trailer URL
                </label>
                <input
                  type="url"
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="https://youtube.com/embed/trailer"
                />
              </motion.div>

              {/* Theme */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Tag size={16} />
                  Theme
                </label>
                <input
                  type="text"
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter movie theme"
                />
              </motion.div>

              {/* Actors */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Users size={16} />
                  Actors
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentActor}
                    onChange={(e) => setCurrentActor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActor())}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Add actor name"
                  />
                  <motion.button
                    type="button"
                    onClick={addActor}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.actors.map((actor, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {actor}
                      <button
                        type="button"
                        onClick={() => removeActor(actor)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Genres */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Tag size={16} />
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {genreOptions.map((genre) => (
                    <motion.button
                      key={genre}
                      type="button"
                      onClick={() => 
                        formData.genre.includes(genre) 
                          ? removeGenre(genre) 
                          : addGenre(genre)
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.genre.includes(genre)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {genre}
                    </motion.button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.genre.map((genre) => (
                    <motion.span
                      key={genre}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 bg-red-600 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 space-y-2"
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Film size={16} />
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors resize-none"
              placeholder="Enter movie description..."
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-4 mt-8"
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  Creating Movie...
                </>
              ) : (
                <>
                  <Plus size={24} />
                  Create Movie
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateMovie;