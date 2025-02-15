import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home/Home.jsx";
import "./root.css";

function App() {
       const AppHtml = (
              <Router>
                     <Routes>
                            <Route path="/" element={<Home />} />
                     </Routes>
              </Router>
       );
       return AppHtml;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);