
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from './App.jsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CarDetailPage from './carDetailPage'
import LoginPage from './loginForm.jsx'


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<App />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/car/:carId" element={<CarDetailPage />} />
    </Routes>
      </BrowserRouter>
  </React.StrictMode>
)
