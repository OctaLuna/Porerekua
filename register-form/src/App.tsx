import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import RegistrationGateway from './components/registration/RegistrationGateway';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro/*" element={<RegistrationGateway />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
