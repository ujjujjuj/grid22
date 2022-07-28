import "./App.css";
import Login from "./components/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import UserHome from "./components/Home";
import { AuthProvider } from "./hooks/auth";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<UserHome />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
