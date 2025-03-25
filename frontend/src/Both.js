
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './Sample.css';
import './Login.css';
import './Help.css';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import googleLogo from './google.svg';
import appleLogo from './apple.svg';
import Screen from './Screen';


const getcsrf = async (endpoint, method) => {
  try {
    const url = `http://127.0.0.1:8000/api/${endpoint}/`;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include"
    }

    const response = await fetch(url, options);
    if (response.ok) {
      const result = await response.json();
      return result.token;
    }
  }
  catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
}

const apiCall = async (endpoint, method, body = null, token = null) => {
  try {
    const url = `http://127.0.0.1:8000/api/${endpoint}/`;
    const csrftoken = await getcsrf("csrf", "GET");

    console.log("Cookies before request:", document.cookie);

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': csrftoken
      },
      credentials: "include"
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }

    if (body !== null) {
      console.log("Request Body:", body);
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    console.log("Response cookies:", response.headers.get('set-cookie'));

    if (response.ok) {
      const result = await response.json();
      console.log("Result:", JSON.stringify(result, null, 2));
      return result;
    }
    else {
      return { status: false, error: `Error: ${response.statusText}` };
    }
  } catch (error) {
    console.error('Error:', error);
    return { status: false, error: error.message };
  }
}


const getUserDetails = async (navigate, setShowLoginOverlay) => {
  const token = localStorage.getItem("accessToken")
  console.log(token)
  try {
    if (token) {
      const result = await apiCall("userdetails", "GET", null, token)
      if (result.status) {
        navigate('/screen');
      }
      else {
        console.log("User is not authenticated.");
        setShowLoginOverlay(true);
      }
    } else {
      console.log("User is not authenticated.");
      setShowLoginOverlay(true);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    setShowLoginOverlay(true);
  }
};


function Home() {
  const navigate = useNavigate();
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);

  return (
    <div className="container">
      <div className="video-container">
        <video autoPlay loop muted playsInline className="background-video">
          <source src={process.env.PUBLIC_URL + '/Background.mp4'} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>
      <header className="header">
        <button className="header-button" onClick={() => setShowLoginOverlay(true)}>Login</button>
        <button className="header-button" onClick={() => setShowHelpOverlay(true)}>Help</button>
      </header>
      <main className="main-content">
        <h1 className="title">Morse Code Translator</h1>
        <button className="get-started" onClick={() => getUserDetails(navigate, setShowLoginOverlay)}>Get Started</button>
      </main>

      {showLoginOverlay && (
        <div className="login-overlay">
          <LoginOverlay onClose={() => setShowLoginOverlay(false)} navigate={navigate} />
        </div>
      )}

      {showHelpOverlay && (
        <div className="help-overlay">
          <HelpOverlay onClose={() => setShowHelpOverlay(false)} />
        </div>
      )}
    </div>
  );
}

function HelpOverlay({ onClose }) {
  const [issue, setIssue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Issue submitted:", issue);
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        alert("Please log in to submit your issue 🔐😊")
        return;
        // toast.warn("🔐 Please log in to submit your issue!", {
        //   position: "top-center",
        //   autoClose: 3000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        // });
        // return;
      }
      const result = await apiCall("issue_email", "POST", { issue }, token)
      if (result.status === true) {
        alert("Your issue has been submitted. Thank you!");
      }
      else {
        alert("Sending failed!!!")
      }
    }
    catch (error) {
      alert("There is an error in sending the email")
    }

    setIssue('');
    onClose();
  };

  return (
    <div className="help-container">
      <button className="help-back-button" onClick={onClose}>Back</button>
      <h2 className="help-title">Help Center</h2>
      <form className="help-form" onSubmit={handleSubmit}>
        <div className="help-input-wrapper">
          <textarea
            className="help-textarea"
            placeholder="Share your issues"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="help-send-button">
          Send
        </button>
      </form>
    </div>
  );
}

function SocialLogin() {
  return (
    <div className="social-login">
      <button className="social-button">
        <img src={googleLogo} alt="Google" className="social-icon" />
        Google
      </button>
      <button className="social-button">
        <img src={appleLogo} alt="Apple" className="social-icon" />
        Apple
      </button>
    </div>
  );
}

function InputField({ type, placeholder, value, onChange }) {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  return (
    <div className="input-wrapper">
      <input
        type={isPasswordShown ? 'text' : type}
        placeholder={placeholder}
        className="input-field"
        value={value}
        onChange={onChange}
        required
      />
      {type === 'password' && (
        <i
          onClick={() => setIsPasswordShown(!isPasswordShown)}
          className="material-symbols-rounded eye-icon"
        >
          {isPasswordShown ? <FiEyeOff /> : <FiEye />}
        </i>
      )}
    </div>
  );
}

function LoginOverlay({ onClose, navigate }) {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignUp = async (username, email, password) => {
    console.log("Function called");
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    const result = await apiCall("signup", "POST", { username, email, password })
    if (result.status) {
      localStorage.setItem("accessToken", result.tokens.access)
      localStorage.setItem("refreshToken", result.tokens.refresh)
      console.log("Sign up successful")
      navigate('/screen')
    }
  }

  const handleLogin = async (email, password) => {
    const result = await apiCall("login", "POST", { email, password })
    if (result.status) {
      localStorage.setItem("accessToken", result.tokens.access)
      localStorage.setItem("refreshToken", result.tokens.refresh)
      console.log("Login successful")
      navigate('/screen')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    isSignupMode
      ? handleSignUp(username, email, password)
      : handleLogin(email, password);
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={onClose}>Back</button>
      <h2 className="form-title">{isSignupMode ? 'Sign Up' : 'Log In'} with</h2>
      <SocialLogin />
      <p className="separator"><span>or</span></p>
      <form className="login-form" onSubmit={handleSubmit}>
        {isSignupMode && (
          <>
            <InputField
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </>
        )}
        <InputField
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          {isSignupMode ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      {!isSignupMode && (
        <p className="signup-prompt">
          Don&apos;t have an account?
          <button onClick={() => setIsSignupMode(true)} className="signup-link">Sign up</button>
        </p>
      )}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', { state: { showLogin: true } });
  }, [navigate]);

  return null;
}

export default function Both() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/screen" element={<Screen />}></Route>
      </Routes>
    </Router>
  );
}















