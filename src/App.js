import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegistrationForm from './components/LoginRegistrationForm';
import Home from './pages/Home';  
import Application_status from './pages/Application_status';
import MentorPage from './pages/Mentor';
import AdminPage from './pages/Admin';
import ViewApplications from './pages/ViewAppplications';
import Users from './components/Users';


function App() {
  const userId = '1';

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users/:token" element={<Users />} />
          <Route path="/login" element={<LoginRegistrationForm />} />
          <Route path="/mentor/:userId/:username" element={<MentorPage />} />
          <Route path="/admin/:userId/:username/:token" element={<AdminPage />} />
          <Route path="/application_status/:userId/:username" element={<Application_status />} />
          <Route path="/applications/:username/:internshipId" element={<ViewApplications />} />
          {/* <Route path="/Otp" element={<Otp />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
