import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import PublicDashboard from './pages/PublicDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PublicReport from './pages/PublicReport';
import Heatmap from './pages/Heatmap';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import ImpactGallery from './pages/ImpactGallery';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/public-dashboard" element={
            <ProtectedRoute allowedRoles={['public']}>
              <PublicDashboard />
            </ProtectedRoute>
          } />

          <Route path="/report" element={
            <ProtectedRoute>
              <PublicReport />
            </ProtectedRoute>
          } />

          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/gallery" element={<ImpactGallery />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
