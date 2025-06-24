
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import Brand from './brand'
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
    <Route path="/brand/:brandName" element={<Brand />} />
    </Routes>
      </BrowserRouter>
  </React.StrictMode>
)
/*
createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <BrowserRouter>
    <App />
    </BrowserRouter >
     </StrictMode>
)
*/