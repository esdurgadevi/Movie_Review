import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovieList from './MovieList';
import CreateMovie from './CreateMovie';
import CineStreamLogin from './CineStreamLogin';
import { Users } from 'lucide-react';
import UserProfile from './UserProfile';
import UserList from './UserList';
import ReviewsDashboard from './ReviewsDashboard';
import MovieListAdmin from './MovieListAdmin';
import MovieListUser from './MovieListUser';

function App() {
 
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<CineStreamLogin />} />
        <Route path='/dashboard' element={<ReviewsDashboard />} />
        {/* movielist admin */}
        <Route path="/movielist-admin" element={<MovieListAdmin />} />
        {/* movielist user */}
        <Route path="/movielist-user" element={<MovieListUser />} />
        <Route path="/userlist" element={<UserList />} />
        <Route path="/create" element={<CreateMovie />} />
        <Route path="/user/:id" element={<UserProfile />} />

      </Routes>
    </Router>
    </>
  )
}

export default App
