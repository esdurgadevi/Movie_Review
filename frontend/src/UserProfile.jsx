import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Film, Calendar, User, Clock } from 'lucide-react';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userResponse = await fetch(`http://localhost:5000/api/users/${id}`);
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      
      const userData = await userResponse.json();
      setUser(userData.data);

      // Fetch all movies and filter reviews by this user
      const moviesResponse = await fetch('http://localhost:5000/api/movies');
      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
        
        // Extract reviews posted by this user from all movies
        const reviews = [];
        moviesData.forEach(movie => {
          if (movie.reviews && movie.reviews.length > 0) {
            movie.reviews.forEach(review => {
              if (review.userId === id) {
                reviews.push({
                  ...review,
                  movieId: movie._id,
                  movieTitle: movie.title,
                  moviePoster: movie.posterUrl,
                  movieDirector: movie.director,
                  movieGenre: movie.genre,
                  movieDuration: movie.duration,
                  movieReleaseDate: movie.releaseDate
                });
              }
            });
          }
        });
        
        setUserReviews(reviews);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-red-500 text-2xl">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-b from-black to-transparent p-6 fixed w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-red-600 text-3xl font-bold flex items-center gap-2">
            <Film size={32} />
            CineStream
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* User Profile Section */}
          <section className="mb-12">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-purple-700 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {user.name?.charAt(0) || user.username?.charAt(0)}
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
                    {user.name}
                  </h1>
                  <p className="text-gray-400 text-lg mb-6">@{user.username}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600">
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <div className="bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600">
                      <p className="text-gray-400 text-sm mb-1">Age</p>
                      <p className="text-white font-medium">{user.age} years</p>
                    </div>
                    <div className="bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600">
                      <p className="text-gray-400 text-sm mb-1">Role</p>
                      <p className="text-white font-medium capitalize">{user.role}</p>
                    </div>
                    <div className="bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600">
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <p className={`font-medium ${user.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                        {user.isVerified ? 'Verified' : 'Pending Verification'}
                      </p>
                    </div>
                    <div className="bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600">
                      <p className="text-gray-400 text-sm mb-1">Member Since</p>
                      <p className="text-white font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-700 bg-opacity-50 rounded-xl p-4 border border-gray-600">
                      <p className="text-gray-400 text-sm mb-1">Total Reviews</p>
                      <p className="text-white font-medium text-xl">{userReviews.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <h2 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4 flex items-center gap-3">
              <Star className="text-yellow-400" size={28} />
              My Movie Reviews ({userReviews.length})
            </h2>
            
            {userReviews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userReviews.map((review) => (
                  <div
                    key={`${review.movieId}-${review.reviewedAt}`}
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-700 hover:bg-opacity-50 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 hover:border-red-500"
                  >
                    <div className="flex gap-4">
                      {/* Movie Poster */}
                      <div className="flex-shrink-0">
                        <img
                          src={review.moviePoster}
                          alt={review.movieTitle}
                          className="w-20 h-28 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x112/1f2937/6b7280?text=No+Image';
                          }}
                        />
                      </div>
                      
                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        {/* Movie Title */}
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                          {review.movieTitle || 'Unknown Movie'}
                        </h3>
                        
                        {/* Movie Details */}
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{review.movieDirector}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{Math.floor((review.movieDuration || 0) / 60)}h {(review.movieDuration || 0) % 60}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{review.movieReleaseDate ? new Date(review.movieReleaseDate).getFullYear() : 'N/A'}</span>
                          </div>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, index) => (
                              <Star
                                key={index}
                                size={18}
                                className={index < Math.floor(review.rating || 0) ? 'fill-current' : 'text-gray-600'}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-white font-semibold text-lg">
                            {review.rating}/5
                          </span>
                        </div>
                        
                        {/* Review Text */}
                        <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
                          {review.comment || 'No review text provided.'}
                        </p>
                        
                        {/* Review Date */}
                        <div className="text-xs text-gray-500 border-t border-gray-600 pt-3">
                          Reviewed on {new Date(review.reviewedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Genre Tags */}
                    {review.movieGenre && review.movieGenre.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-600">
                        {review.movieGenre.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="bg-red-600 bg-opacity-20 text-red-400 px-2 py-1 rounded-full text-xs font-medium border border-red-500 border-opacity-30"
                          >
                            {genre}
                          </span>
                        ))}
                        {review.movieGenre.length > 3 && (
                          <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs">
                            +{review.movieGenre.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* No Reviews Message */
              <div className="text-center py-16">
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-12 max-w-2xl mx-auto border border-gray-700">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="text-gray-400" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No Reviews Yet</h3>
                  <p className="text-gray-400 text-lg mb-6">
                    {user.name} hasn't reviewed any movies yet. Start exploring movies and share your thoughts!
                  </p>
                  <div className="text-gray-500 text-sm">
                    Reviews will appear here once you start rating and reviewing movies.
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 bg-opacity-50 border-t border-gray-800 py-8 px-6 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <Film size={16} />
            CineStream User Profile • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserProfile;