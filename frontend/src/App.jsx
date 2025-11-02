import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovieList from './MovieList';
import CreateMovie from './CreateMovie';
import CineStreamLogin from './CineStreamLogin';
import { Users } from 'lucide-react';

function App() {
 
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<CineStreamLogin />} />
        <Route path="/movielist/:id" element={<MovieList />} />
        <Route path="/create" element={<CreateMovie />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
