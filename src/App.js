import './App.css';
import Login from './components/login';
import { AuthProvider } from './hooks/auth';
import { BrowserRouter as Router, Routes, Route,   Navigate } from "react-router-dom";

import UserHome from './components/Home';
import Register from './components/register';
import Admin from './components/Admin';
import { useAuth } from './hooks/auth';

function App() {

  return (
    <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}




export default App;
