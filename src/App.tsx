import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { AuthProvider } from './contexts/AuthContext';
    import PrivateRoute from './components/PrivateRoute';
    import Navbar from './components/Navbar';
    import Login from './pages/Login';
    import Register from './pages/Register';
    import Dashboard from './pages/Dashboard';
    import Profile from './pages/Profile';
    import Settings from './pages/Settings';
    import Workouts from './pages/Workouts';
    import Leaderboard from './pages/Leaderboard';
    import Welcome from './pages/Welcome';
    
    function App() {
      return (
        <Router>
          <AuthProvider>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Welcome />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/wod"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/workouts"
                    element={
                      <PrivateRoute>
                        <Workouts />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <PrivateRoute>
                        <Leaderboard />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
          </AuthProvider>
        </Router>
      );
        }  
    
    export default App;
