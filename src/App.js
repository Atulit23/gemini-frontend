import logo from "./logo.svg";
import "./App.css";
import Home from "./Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import LandingPage from "./components/pages/LandingPage";
import SignInPage from "./components/pages/LoginPage";
import SignUpPage from "./components/pages/RegisterPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<SignInPage />}/>
        <Route path="/register" element={<SignUpPage />}/>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/chat" element={<Home />}/>
      </Routes>
    </Router>
  );
}

export default App;
