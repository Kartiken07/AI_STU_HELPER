import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './Components/Login';
import SignupPage from './Components/Signup_page';
import QuizPage from './Components/Quiz_interface';
import StudentCareerHelper from './Components/Chat_Bot_Interface';
import ChatBotWithFileUpload from './Components/PDF_Reader_Rag';

import StudentDashboard from './Components/Chartsinterface';
import Navbar from './Components/Navbar';
import HomePage from './Components/Homepage';
import { AdminDashboard } from './Components/AdminDashboard';
import { ToastProvider } from './Components/Toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/signup" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!hideNavbar && isLoggedIn && (
        <Navbar onLogout={logout} isLoggedIn={isLoggedIn} />
      )}

      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/home" replace /> : <LoginPage />
          }
        />

        <Route
          path="/signup"
          element={
            isLoggedIn ? <Navigate to="/home" replace /> : <SignupPage />
          }
        />

        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/signup" replace />
          }
        />

        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><StudentCareerHelper /></ProtectedRoute>} />
        <Route path="/pdf" element={<ProtectedRoute><ChatBotWithFileUpload /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        <Route
          path="*"
          element={
            isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/signup" replace />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
