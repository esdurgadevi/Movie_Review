import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Filter, 
  Star, 
  Users, 
  MessageSquare,
  Calendar,
  BarChart3,
  TrendingUp,
  PieChart
} from 'lucide-react';

// Import jsPDF for PDF generation
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MovieReviewsDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [activeGraph, setActiveGraph] = useState('ratingDistribution');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch all movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies');
        const moviesData = await response.json();
        setMovies(moviesData);
        
        if (moviesData.length > 0) {
          // Select first movie by default
          handleMovieSelect(moviesData[0]);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Fetch movie details and reviews
  const handleMovieSelect = async (movie) => {
    setSelectedMovie(movie);
    setAnalyticsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${movie._id}`);
      const movieData = await response.json();
      setMovieDetails(movieData);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Calculate analytics based on reviews
  const calculateAnalytics = () => {
    if (!movieDetails || !movieDetails.reviews) return null;

    const reviews = movieDetails.reviews;
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: '0.0',
        ratingDistribution: [0, 0, 0, 0, 0],
        recentReviews: 0,
        recentPercentage: '0.0',
        monthlyTrends: [],
        topReviewers: [],
        sentimentAnalysis: { positive: 0, negative: 0, neutral: 0 }
      };
    }

    // Rating statistics
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = [0, 0, 0, 0, 0]; // 1-5 stars
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[5 - rating]++;
      }
    });

    // Recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = reviews.filter(review => 
      new Date(review.reviewedAt) > thirtyDaysAgo
    );

    // Review trends by month
    const monthlyTrends = {};
    reviews.forEach(review => {
      const date = new Date(review.reviewedAt);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyTrends[monthYear]) {
        monthlyTrends[monthYear] = { count: 0, totalRating: 0 };
      }
      
      monthlyTrends[monthYear].count++;
      monthlyTrends[monthYear].totalRating += review.rating;
    });

    // Convert to array for chart
    const trendData = Object.entries(monthlyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        reviews: data.count,
        avgRating: data.totalRating / data.count
      }));

    return {
      totalReviews,
      averageRating: averageRating.toFixed(1),
      ratingDistribution,
      recentReviews: recentReviews.length,
      recentPercentage: ((recentReviews.length / totalReviews) * 100).toFixed(1),
      monthlyTrends: trendData,
      topReviewers: getTopReviewers(reviews),
      sentimentAnalysis: analyzeSentiment(reviews)
    };
  };

  // Get top reviewers
  const getTopReviewers = (reviews) => {
    const reviewerCount = {};
    reviews.forEach(review => {
      const userId = review.userId;
      reviewerCount[userId] = (reviewerCount[userId] || 0) + 1;
    });

    return Object.entries(reviewerCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, count }));
  };

  // Basic sentiment analysis
  const analyzeSentiment = (reviews) => {
    const positiveWords = ['amazing', 'love', 'great', 'excellent', 'awesome', 'good', 'best', 'recommended', 'brilliant', 'fantastic', 'wonderful', 'perfect', 'outstanding', 'masterpiece', 'enjoyed'];
    const negativeWords = ['bad', 'terrible', 'awful', 'boring', 'disappointing', 'poor', 'worst', 'waste', 'horrible', 'hate', 'dislike', 'awful', 'rubbish', 'garbage', 'trash'];
    
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    reviews.forEach(review => {
      const comment = review.comment?.toLowerCase() || '';
      const hasPositive = positiveWords.some(word => comment.includes(word));
      const hasNegative = negativeWords.some(word => comment.includes(word));
      
      if (hasPositive && !hasNegative) positive++;
      else if (hasNegative && !hasPositive) negative++;
      else neutral++;
    });

    return { positive, negative, neutral };
  };

  // Export analytics data as PDF
  const exportAnalytics = () => {
    setExportLoading(true);
    
    const analytics = calculateAnalytics();
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(`Movie Analytics Report: ${movieDetails.title}`, 20, 30);
    
    // Add movie information
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Movie details section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Movie Information', 20, 65);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    let yPosition = 75;
    
    doc.text(`Title: ${movieDetails.title}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Description: ${movieDetails.description}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Genre: ${movieDetails.genre?.join(', ') || 'N/A'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Director: ${movieDetails.director || 'N/A'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Release Date: ${new Date(movieDetails.releaseDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Key metrics section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Key Metrics', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    const metrics = [
      ['Total Reviews', analytics.totalReviews],
      ['Average Rating', `${analytics.averageRating}/5`],
      ['Recent Reviews (30 days)', `${analytics.recentReviews} (${analytics.recentPercentage}%)`],
      ['Active Reviewers', analytics.topReviewers.length]
    ];
    
    metrics.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;

    // Rating distribution table
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Rating Distribution', 20, yPosition);
    yPosition += 10;
    
    const ratingData = analytics.ratingDistribution.map((count, index) => {
      const rating = 5 - index;
      const percentage = ((count / analytics.totalReviews) * 100).toFixed(1);
      return [`${rating} Stars`, count, `${percentage}%`];
    });
    
    doc.autoTable({
      startY: yPosition,
      head: [['Rating', 'Count', 'Percentage']],
      body: ratingData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;

    // Sentiment analysis
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Sentiment Analysis', 20, yPosition);
    yPosition += 10;
    
    const sentimentData = [
      ['Positive', analytics.sentimentAnalysis.positive],
      ['Negative', analytics.sentimentAnalysis.negative],
      ['Neutral', analytics.sentimentAnalysis.neutral]
    ];
    
    doc.autoTable({
      startY: yPosition,
      head: [['Sentiment', 'Count']],
      body: sentimentData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;

    // Top reviewers table
    if (analytics.topReviewers.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Top Reviewers', 20, yPosition);
      yPosition += 10;
      
      const reviewerData = analytics.topReviewers.map((reviewer, index) => [
        `#${index + 1}`,
        reviewer.userId,
        reviewer.count
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [['Rank', 'User ID', 'Reviews']],
        body: reviewerData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 10 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Recent reviews section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Recent Reviews Sample', 20, yPosition);
    yPosition += 10;
    
    // Take first 10 reviews for the PDF
    const sampleReviews = movieDetails.reviews.slice(0, 10);
    const reviewData = sampleReviews.map((review, index) => [
      `#${index + 1}`,
      review.userId,
      `${review.rating}/5`,
      new Date(review.reviewedAt).toLocaleDateString(),
      review.comment ? (review.comment.length > 50 ? review.comment.substring(0, 50) + '...' : review.comment) : 'No comment'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['#', 'User ID', 'Rating', 'Date', 'Comment']],
      body: reviewData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 60 } // Comment column width
      }
    });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    // Save the PDF
    doc.save(`${movieDetails.title.replace(/\s+/g, '_')}_Analytics_Report_${new Date().getTime()}.pdf`);
    
    setExportLoading(false);
  };

  // Graph Components (unchanged)
  const RatingDistributionChart = ({ data, height = 200 }) => (
    <div className="space-y-3" style={{ height: `${height}px` }}>
      {[5, 4, 3, 2, 1].map((rating, index) => {
        const count = data[5 - rating];
        const total = data.reduce((sum, val) => sum + val, 0);
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={rating} className="flex items-center">
            <span className="w-8 text-gray-400 flex items-center gap-1">
              {rating}<Star size={12} className="text-yellow-400" />
            </span>
            <div className="flex-1 bg-gray-700 rounded-full h-4 mx-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 h-4 rounded-full relative"
              >
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white font-semibold">
                  {count}
                </span>
              </motion.div>
            </div>
            <span className="w-16 text-gray-400 text-sm text-right">
              {percentage.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );

  const TrendLineChart = ({ data, height = 250 }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No trend data available
        </div>
      );
    }

    const maxReviews = Math.max(...data.map(d => d.reviews));
    const maxRating = 5;

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${data.length * 80} 100`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((line, index) => (
            <line
              key={index}
              x1="0"
              y1={line}
              x2={data.length * 80}
              y2={line}
              stroke="#374151"
              strokeWidth="1"
            />
          ))}
          
          {/* Reviews line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
            d={data.map((point, index) => 
              `${index === 0 ? 'M' : 'L'} ${index * 80 + 40} ${100 - (point.reviews / maxReviews * 100)}`
            ).join(' ')}
            fill="none"
            stroke="url(#reviewsGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Rating line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            d={data.map((point, index) => 
              `${index === 0 ? 'M' : 'L'} ${index * 80 + 40} ${100 - (point.avgRating / maxRating * 100)}`
            ).join(' ')}
            fill="none"
            stroke="url(#ratingGradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
            strokeLinecap="round"
          />
          
          {/* Points */}
          {data.map((point, index) => (
            <g key={index}>
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                cx={index * 80 + 40}
                cy={100 - (point.reviews / maxReviews * 100)}
                r="4"
                fill="#3B82F6"
              />
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                cx={index * 80 + 40}
                cy={100 - (point.avgRating / maxRating * 100)}
                r="3"
                fill="#10B981"
              />
            </g>
          ))}
          
          <defs>
            <linearGradient id="reviewsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-4">
          {data.map((point, index) => (
            <div key={index} className="text-xs text-gray-400 text-center w-16">
              {point.month}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SentimentPieChart = ({ data, height = 200 }) => {
    const total = data.positive + data.negative + data.neutral;
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          No sentiment data available
        </div>
      );
    }

    const positivePercent = (data.positive / total) * 100;
    const negativePercent = (data.negative / total) * 100;
    const neutralPercent = (data.neutral / total) * 100;

    return (
      <div className="flex items-center justify-between">
        <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Neutral */}
            <motion.circle
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${neutralPercent} 100` }}
              transition={{ duration: 1 }}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#6B7280"
              strokeWidth="20"
              strokeDasharray={`${neutralPercent} 100`}
              transform="rotate(-90 50 50)"
            />
            {/* Negative */}
            <motion.circle
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${negativePercent} 100` }}
              transition={{ duration: 1, delay: 0.3 }}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#EF4444"
              strokeWidth="20"
              strokeDasharray={`${negativePercent} 100`}
              strokeDashoffset={-neutralPercent}
              transform="rotate(-90 50 50)"
            />
            {/* Positive */}
            <motion.circle
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${positivePercent} 100` }}
              transition={{ duration: 1, delay: 0.6 }}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10B981"
              strokeWidth="20"
              strokeDasharray={`${positivePercent} 100`}
              strokeDashoffset={-(neutralPercent + negativePercent)}
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
        
        <div className="space-y-3 ml-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-300">Positive: {data.positive} ({positivePercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-300">Negative: {data.negative} ({negativePercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-300">Neutral: {data.neutral} ({neutralPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const analytics = calculateAnalytics();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Movie Reviews Analytics
            </h1>
            <p className="text-gray-400 mt-2">Detailed analysis of movie reviews and audience engagement</p>
          </div>
          
          {movieDetails && (
            <motion.button
              onClick={exportAnalytics}
              disabled={exportLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {exportLoading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Download size={20} />
              )}
              Export PDF Report
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Rest of the component remains unchanged */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Movies List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-800 rounded-xl p-6 h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
              <Filter size={20} />
              Movies
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {movies.map((movie, index) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedMovie?._id === movie._id
                      ? 'bg-blue-600 transform scale-105 shadow-lg'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleMovieSelect(movie)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm">{movie.title}</h3>
                    <span className="bg-gray-600 px-2 py-1 rounded-full text-xs">
                      {movie.ratingCount || 0}
                    </span>
                  </div>
                  {movie.ratingAverage && (
                    <div className="flex items-center mt-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.floor(movie.ratingAverage) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-300 ml-2">
                        {movie.ratingAverage?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          {analyticsLoading ? (
            <div className="bg-gray-800 rounded-xl p-12 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          ) : movieDetails && analytics ? (
            <div className="space-y-8">
              {/* Movie Header */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{movieDetails.title}</h2>
                    <p className="text-gray-400 mt-1">{movieDetails.description}</p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <span className="text-sm text-gray-300">⭐ {analytics.averageRating}/5 Average</span>
                      <span className="text-sm text-gray-300">📝 {analytics.totalReviews} Reviews</span>
                      <span className="text-sm text-gray-300">🎬 {movieDetails.genre?.join(', ')}</span>
                      <span className="text-sm text-gray-300">👨‍💼 {movieDetails.director}</span>
                    </div>
                  </div>
                  {movieDetails.posterUrl && (
                    <img 
                      src={movieDetails.posterUrl} 
                      alt={movieDetails.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 text-center border-l-4 border-blue-500">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-gray-400 text-sm font-semibold">Total Reviews</h3>
                  <p className="text-3xl font-bold mt-2">{analytics.totalReviews}</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 text-center border-l-4 border-green-500">
                  <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-gray-400 text-sm font-semibold">Average Rating</h3>
                  <p className="text-3xl font-bold mt-2">{analytics.averageRating}/5</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 text-center border-l-4 border-purple-500">
                  <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-gray-400 text-sm font-semibold">Recent Reviews</h3>
                  <p className="text-3xl font-bold mt-2">{analytics.recentReviews}</p>
                  <p className="text-sm text-gray-400 mt-1">{analytics.recentPercentage}% of total</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 text-center border-l-4 border-yellow-500">
                  <MessageSquare className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="text-gray-400 text-sm font-semibold">Engagement</h3>
                  <p className="text-3xl font-bold mt-2">{analytics.topReviewers.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Active reviewers</p>
                </div>
              </div>

              {/* Graph Selector */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-200 flex items-center gap-2">
                    <BarChart3 size={24} />
                    Analytics Overview
                  </h3>
                  
                  <div className="flex space-x-2 bg-gray-700 rounded-lg p-1">
                    {[
                      { id: 'ratingDistribution', label: 'Ratings', icon: Star },
                      { id: 'trend', label: 'Trend', icon: TrendingUp },
                      { id: 'sentiment', label: 'Sentiment', icon: PieChart }
                    ].map((graph) => {
                      const Icon = graph.icon;
                      return (
                        <button
                          key={graph.id}
                          onClick={() => setActiveGraph(graph.id)}
                          className={`px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
                            activeGraph === graph.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <Icon size={16} />
                          {graph.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Graph Container */}
                <div className="bg-gray-900 rounded-lg p-6 min-h-96">
                  {activeGraph === 'ratingDistribution' && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">Rating Distribution</h4>
                      <RatingDistributionChart data={analytics.ratingDistribution} height={200} />
                    </div>
                  )}

                  {activeGraph === 'trend' && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">Review Trends</h4>
                      <div className="text-sm text-gray-400 mb-4">
                        <span className="text-blue-400">●</span> Reviews &nbsp;
                        <span className="text-green-400">●</span> Average Rating
                      </div>
                      <TrendLineChart data={analytics.monthlyTrends} height={250} />
                    </div>
                  )}

                  {activeGraph === 'sentiment' && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">Review Sentiment Analysis</h4>
                      <SentimentPieChart data={analytics.sentimentAnalysis} height={200} />
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-200 flex items-center gap-2">
                  <MessageSquare size={24} />
                  Recent Reviews ({movieDetails.reviews?.length || 0})
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {movieDetails.reviews && movieDetails.reviews.length > 0 ? (
                    movieDetails.reviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-gray-600 px-2 py-1 rounded">
                              <Star size={14} className="text-yellow-400" />
                              <span className="text-sm font-semibold">{review.rating}/5</span>
                            </div>
                            <span className="text-sm text-gray-300">User: {review.userId}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(review.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No reviews available for this movie
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Movie</h3>
              <p className="text-gray-400">Choose a movie from the list to view its analytics</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MovieReviewsDashboard;