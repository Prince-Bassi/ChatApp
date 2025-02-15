import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home/Home.jsx";
import LoginPage from "./LoginPage/LoginPage.jsx";
import "./root.css";

function App() {
       return (
              <Router>
                     <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<LoginPage />} />
                     </Routes>
              </Router>
       );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);