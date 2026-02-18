import React, { useEffect, useState } from 'react';
import api from "../utils/api";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserAlt, faCalendarAlt, faEye, faEyeSlash, faSignOutAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import userIcon from '../components/images/icons8-user-50.png';
import RegistrationForm from '../components/RegistrationForm';
import Application_status from './Application_status';
import ReCAPTCHA from 'react-google-recaptcha';

const Home = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loggedinUserId, setloggedinUserId] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState();
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showSignupPage, setShowSignupPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const jobsPerPage = 5;
  const [search, setSearch] = useState('');
  const [showMyApplication, setShowMyApplication] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ first_name: '', email: '', username: '', password: '' , phone_number: ''});
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [i_id, seti_id] = useState(null);
  const [token, setToken] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    api
      .get("/auth/me/", { withCredentials: true })
      .then(res => {
        setLoggedInUser(res.data.username);
        setloggedinUserId(res.data.id);
      })
      .catch(() => {
        setLoggedInUser(null);
        setloggedinUserId(null);
      });
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await api.get('/internships/');
      const data = response.data;
      const sortedData = data.sort((a, b) => (a.Status === 'Open' ? -1 : 1));
    setJobs(sortedData);
    } catch (error) {
      console.error('Error fetching internships:', error);
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setLoginErrors({ ...loginErrors, [e.target.name]: '' });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    setSignupErrors({ ...signupErrors, [e.target.name]: '' });
  };

  const validateLogin = () => {
    const errors = {};
    if (!loginData.username) errors.username = 'Username is required';
    if (!loginData.password) errors.password = 'Password is required';
    return errors;
  };

  const validateSignup = () => {
    const errors = {};
    if (!signupData.first_name) errors.first_name = 'First name is required';
    if (!signupData.email) errors.email = 'Email is required';
    if (!signupData.username) errors.username = 'Username is required';
    if (!signupData.password) errors.password = 'Password is required';
    return errors; 
  };


  const handleLogin = (e) => {
    e.preventDefault();
    const errors = validateLogin();
    setLoginErrors(errors);
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
  }
    if (Object.keys(errors).length === 0) {
      api.post("/auth/login/",{ ...loginData, recaptchaToken })
        .then(response => {
          setLoggedInUser(response.data.username);
          setloggedinUserId(response.data.user_id);
          setShowLoginModal(false);
          if (response.data.status === 'staff') {
            alert("Log in as mentor");
            navigate(`/mentor/${response.data.user_id}/${response.data.username}`);
          }else if(response.data.status === 'superuser') {
            alert("Log in as Admin ");
            setToken(response.data.access);
            navigate(`/admin/${response.data.user_id}/${response.data.username}/${response.data.access}`);
          } 
          else {
            setLoggedInUser(response.data.username);
            setloggedinUserId(response.data.user_id);
            setShowLoginModal(false);
          }
        })
        .catch(error => {
          if (error.response && error.response.data) {
            setLoginErrors(error.response.data);
          } else {
            setLoginErrors({ general: 'Invalid username or password' });
          }
        });
        console.log(loginErrors);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const errors = validateSignup();
    setSignupErrors(errors);
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
    } 
  };

  const handleSendEmail = () => {
    const emailData = {
        email: signupData.email,  
        subject: 'Welcome to Our Service!',
        message: `Dear ${signupData.first_name},\n\nThank you for signing up! We're excited to have you on board.\n\nBest regards,\nThe Team`
    };
          api.post("/auth/signup/", {...signupData, recaptchaToken: recaptchaToken})
            .then(response => {
              console.log('Signup response:', response.data);
              setSignupData({ first_name: '', username: '', password: '', email: ''});
              api.post("/auth/send-email/", emailData)
        .then(response => {
            console.log('Email sent response:', response.data);
            alert('Email sent successfully!');
            setOtpSent(true);
            setOtpData({ email: signupData.email });
        })
        .catch(error => {
            console.error('Error sending email:', error);
            alert('There was an error sending the email. Please try again.');
        });
            })
            .catch(error => {
              if (error.response && error.response.data) {
                setSignupErrors(error.response.data);
              } else {
                setSignupErrors({ general: 'Signup error. Please try again.' });
              }
            });
  };


  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
};

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout/", {}, { withCredentials: true });
    } catch (err) {
      console.log("Logout error", err);
    }
    setLoggedInUser(null);
    setShowMyApplication(false);
    setShowRegistrationForm(false);
    navigate("/");
  };

  const handleMyApplication = () => {
    setShowMyApplication(true);
    setShowRegistrationForm(false);
    navigate(`/application_status/${loggedinUserId}/${loggedInUser}`);
  };
  
  const handleHome = () => {
    setShowMyApplication(false);
    setShowRegistrationForm(false);
  }
 
  const handleApplyNowClick = (jobId) => {
    if (loggedinUserId) {
      setShowRegistrationForm(true);
      seti_id(jobId);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleShowDetails = (jobId) => {
    console.log("hi");
    console.log(jobId);
    const job = jobs.find(job => job.id === parseInt(jobId));
    setSelectedInternship(job);
    console.log(selectedInternship);
  };

  const handleCloseDetails = () => {
    setSelectedInternship(null);
  };

  const handlePrevClick = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    setSelectedInternship(null);
  };

  const handleNextClick = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(jobs.length / jobsPerPage)));
    setSelectedInternship(null);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpData, setOtpData] = useState({ email: [], otp_verification: [] });
  const [otpErrors, setOtpErrors] = useState('');

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
  };



  const handleOtpVerification = async (e) => {
    e.preventDefault();
    try {
      api.post("/auth/verify-otp/", {otpData})
      .then(response => {
        setIsOtpVerified(true);
        setOtpSent(false);
        setShowSignupPage(false);
        alert('Signup successful! Please log in.');
        setShowLoginModal(true);
      })
      
    } catch (error) {
      setOtpErrors('Invalid OTP');
    }
  };


  const resendOtpAPI = async (email) => {
    try {
      const response = api.post("/api/resend-otp/" , { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'An error occurred while resending OTP');
    }
  };

  return (
    <> 
      <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-8">
            <span
              onClick={handleHome}
              className="text-lg font-semibold cursor-pointer"
            >
              Internship Portal
            </span>

            <ul className="hidden md:flex gap-6 text-sm">
              <li onClick={handleHome} className="cursor-pointer hover:underline">
                Home
              </li>
              {loggedInUser && (
                <li
                  onClick={handleMyApplication}
                  className="cursor-pointer hover:underline"
                >
                  My Applications
                </li>
              )}
            </ul>
          </div>

          {/* Search */}
          <div className="hidden md:block">
            <input
              type="search"
              placeholder="Search internships..."
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
              className="px-4 py-2 rounded-lg text-black w-72 focus:outline-none"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {loggedInUser ? (
              <>
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full text-sm">
                  <FontAwesomeIcon icon={faUser} />
                  <span>{loggedInUser}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-white/40 rounded-lg hover:bg-white/10 text-sm"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white/10"
              >
                <img src={userIcon} alt="login" className="w-5 h-5" />
                Login
              </button>
            )}
          </div>

        </div>
      </nav>


      

      {!showRegistrationForm && !showMyApplication && (
        <div className="tab-content">
          <div className="max-w-7xl mx-auto px-6 py-8 grid gap-6">
            {currentJobs
              .filter(job =>
                search === "" ? job : job.Title.toLowerCase().includes(search)
              )
              .map((job, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white rounded-xl shadow hover:shadow-lg p-6 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold">{job.Title}</h2>

                    <button
                      onClick={() => handleShowDetails(job.id)}
                      className="text-slate-600 hover:text-black"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 mt-2">
                    <FontAwesomeIcon icon={faUserAlt} /> {job.Mentor}
                  </p>

                  <p className="mt-3 text-sm">
                    <strong>Status:</strong> {job.Status}
                  </p>

                  <p className="mt-2 text-sm">
                    <FontAwesomeIcon icon={faCalendarAlt} /> Duration: {job.Duration}
                  </p>

                  <p className="mt-2 text-sm">
                    <strong>Skills:</strong> {job.Skills}
                  </p>

                  <button
                    onClick={() => handleApplyNowClick(job.id)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              Internship Details
            </h2>

            <p><strong>Title:</strong> {selectedInternship.Title}</p>
            <p><strong>Mentor:</strong> {selectedInternship.Mentor}</p>
            <p><strong>Description:</strong> {selectedInternship.Description}</p>
            <p><strong>Duration:</strong> {selectedInternship.Duration}</p>
            <p><strong>Stipend:</strong> {selectedInternship.Stipend}</p>
            <p><strong>Status:</strong> {selectedInternship.Status}</p>
            <p><strong>Skills:</strong> {selectedInternship.Skills}</p>

            <button
              onClick={handleCloseDetails}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}


      

      {showLoginModal && !loggedInUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 relative">

            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 text-2xl text-slate-600 hover:text-black"
            >
              &times;
            </button>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
              <form onSubmit={handleLogin}>
                <input type="text" className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="username" placeholder="Username" value={loginData.username} onChange={handleLoginChange} />
                {loginErrors.username && (<p className="text-sm text-red-500 mb-2">{loginErrors.username}</p>)}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-slate-600"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </span>
                </div>
                
                {loginErrors.password && <p className="text-sm text-red-500 mb-2">{loginErrors.password}</p>}
                {loginErrors.non_field_errors && (
                  <p className="text-sm text-red-500 mb-2">
                    {loginErrors.non_field_errors[0]}
                  </p>
                )}

                {loginErrors.error && (
                  <p className="text-sm text-red-500 mb-2">
                    {loginErrors.error}
                  </p>
                )}
                <ReCAPTCHA
                sitekey="6LcMBW8sAAAAAAJfePAjYHe4FJQwZ-FjmwFOqE1q"
                onChange={handleRecaptchaChange}
             />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-3"
                >
                  Login
                </button>
                <p className="text-center text-sm mt-4">
                  Don’t have an account?{" "}
                  <span
                    onClick={() => setShowSignupPage(true)}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Signup
                  </span>
                </p>
              </form>
            </div>              
          </div>
        </div>
      )}

      {showSignupPage && !loggedInUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
            {!otpSent ? (
              <>
                <button
                  onClick={() => setShowSignupPage(false)}
                  className="absolute top-3 right-3 text-2xl text-slate-600 hover:text-black"
                >
                  &times;
                </button>

                <div>
                  <h2 className="text-xl font-semibold mb-4 text-center">
                    Create Account
                  </h2>
                  <div id='recaptcha-container'></div>
                  <form onSubmit={handleSignup}>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="Enter your first name"
                      value={signupData.first_name}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {signupErrors.first_name && <p className="text-sm text-red-500 mb-2">{signupErrors.first_name}</p>}
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={signupData.username}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {signupErrors.username && <p className="text-sm text-red-500 mb-2">{signupErrors.username}</p>}
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 cursor-pointer text-slate-600"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </span>
                    </div>
                    {signupErrors.password && <p className="text-sm text-red-500 mb-2">{signupErrors.password}</p>}
                    <input
                      type="text"
                      name="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {signupErrors.email && <p className="text-sm text-red-500 mb-2">{signupErrors.email}</p>}
                    
                    {/* Send Email Button to Trigger OTP */}
                    <button
                      type="submit"
                      onClick={handleSendEmail}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 mt-3"
                    >
                      Send OTP
                    </button>
                    {otpErrors && <p className="text-sm text-red-500 mb-2">{otpErrors}</p>}

                    <div className="my-3 flex justify-center">
                      <ReCAPTCHA
                        sitekey="6LcMBW8sAAAAAAJfePAjYHe4FJQwZ-FjmwFOqE1q"
                        onChange={handleRecaptchaChange}
                      />
                    </div>
                    {signupErrors.general && <p className="text-sm text-red-500 mb-2">{signupErrors.general}</p>}
                  </form>
                  <p className="text-center text-sm mt-4">
                    Already have an account?{" "}
                    <span
                      onClick={() => setShowSignupPage(false)}
                      className="text-indigo-600 cursor-pointer hover:underline"
                    >
                      Login
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div>
                <header>OTP Verification</header>
                <form onSubmit={handleOtpVerification}>
                  <input
                    type="text"
                    name="otp_verification"
                    placeholder="Enter your OTP"
                    value={otpData.otp_verification}
                    onChange={handleOtpChange}
                    className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {otpErrors.otp && <p className="text-sm text-red-500 mb-2">{otpErrors.otp}</p>}
                  {otpErrors.error && <p className="text-sm text-red-500 mb-2">{otpErrors.error}</p>}
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mt-3"
                  >
                    Verify OTP
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}


      {showRegistrationForm && loggedInUser && (
        <RegistrationForm closeModal={() => setShowRegistrationForm(false)} 
        userId={loggedinUserId}
        iId={i_id}
        />
        
      )}
      

      {showMyApplication && loggedInUser && (
         <Application_status  />
      )}
    </>
  );
};

export default Home;
