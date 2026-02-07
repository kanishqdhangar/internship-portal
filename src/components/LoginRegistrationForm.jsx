import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faXmark } from "@fortawesome/free-solid-svg-icons";
import api from "../utils/api";

const LoginRegistrationForm = ({ closeModal, setUser }) => {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    first_name: "",
    email: "",
    username: "",
    password: "",
  });

  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});

  /* ---------------- LOGIN ---------------- */

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErrors({});

    try {
      const res = await api.post("/auth/login/", loginData);
      setUser(res.data);
      closeModal();
      navigate("/");
    } catch (err) {
      setLoginErrors(
        err.response?.data || { general: "Invalid credentials" }
      );
    }
  };

  /* ---------------- SIGNUP ---------------- */

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupErrors({});

    try {
      await api.post("/auth/signup/", signupData);
      alert("Signup successful! Please login.");
      setIsSignup(false);
    } catch (err) {
      setSignupErrors(
        err.response?.data || { general: "Signup failed" }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-slate-500 hover:text-black"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-center mb-6">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {/* ---------------- LOGIN FORM ---------------- */}
        {!isSignup && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            {loginErrors.username && (
              <p className="text-sm text-red-500">{loginErrors.username}</p>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-slate-600"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>

            {loginErrors.general && (
              <p className="text-sm text-red-500">{loginErrors.general}</p>
            )}

            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
              Login
            </button>

            <p className="text-sm text-center">
              Don’t have an account?{" "}
              <span
                onClick={() => setIsSignup(true)}
                className="text-indigo-600 cursor-pointer hover:underline"
              >
                Signup
              </span>
            </p>
          </form>
        )}

        {/* ---------------- SIGNUP FORM ---------------- */}
        {isSignup && (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="First Name"
              value={signupData.first_name}
              onChange={(e) =>
                setSignupData({ ...signupData, first_name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="text"
              placeholder="Username"
              value={signupData.username}
              onChange={(e) =>
                setSignupData({ ...signupData, username: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-slate-600"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>

            {signupErrors.general && (
              <p className="text-sm text-red-500">{signupErrors.general}</p>
            )}

            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
              Signup
            </button>

            <p className="text-sm text-center">
              Already have an account?{" "}
              <span
                onClick={() => setIsSignup(false)}
                className="text-indigo-600 cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegistrationForm;
