import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from './App.jsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import LoginPage from './loginForm.jsx'
import './index.css'


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<App />} />
    <Route path="/login" element={<LoginPage />} />
    </Routes>
      </BrowserRouter>
  </React.StrictMode>
)
