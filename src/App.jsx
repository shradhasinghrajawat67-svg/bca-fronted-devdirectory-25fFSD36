import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Search from './pages/Search';
import UserDirectory from './pages/UserDirectory';
import UserProfile from './pages/UserProfile';
import Article from './pages/Article';
import AddPost from './pages/AddPost';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Challenges from './pages/Challenges';
import SkillGap from './pages/SkillGap';
import Ideas from './pages/Ideas';
import Projects from './pages/Projects';
import CardPage from './pages/CardPage';
import Network from './pages/Network';
import Copilot from './pages/Copilot';
import Insights from './pages/Insights';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <ScrollToTop />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/posts/:id" element={<Article />} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute><AddPost /></ProtectedRoute>} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/card" element={<CardPage />} />
          <Route path="/card/:handle" element={<CardPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/edit" element={<ProtectedRoute><Signup /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
          <Route path="/add-post" element={<ProtectedRoute><AddPost /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
