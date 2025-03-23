// // import React, { useState } from 'react';
// import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// import './Sample.css';
// import './Login.css';
// import { FiHelpCircle, FiEyeOff, FiEye } from 'react-icons/fi';
// import googleLogo from './google.svg';
// import appleLogo from './apple.svg';
// import Screen from './Screen'; // Ensure correct path



// const apiCall = async (endpoint, method, body = null) => {
//   try {
//     const url = `http://127.0.0.1:8000/api/${endpoint}/`;
//     const options = {
//       method: method,
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       credentials: "include"
//     };

//     if (body !== null) {
//       console.log("Request Body:", body);
//       options.body = JSON.stringify(body)

//     }
//     const response = await fetch(url, options)
//     if (response.ok) {
//       const result = await response.json();
//       console.log("Result : " + JSON.stringify(result, null, 2))
//       return result
//     }
//     else {
//       return { status: false, error: `Error: ${response.statusText}` };
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     // alert('An error occurred. Please try again.');
//     return { status: false, error: error.message };
//   }
// }

// const getUserDetails = async (navigate) => {
//   const result = await apiCall("userdetails", "GET")
//   try {
//     if (result.status) {
//       navigate('/screen');
//     } else {
//       console.log("User is not authenticated.");
//       navigate('/login');
//     }
//   } catch (error) {
//     console.error("Fetch error:", error);
//     navigate('/login');
//   }
// }

// function Home() {
//   const navigate = useNavigate();

//   return (
//     <div className="container">
//       <div className="video-container">
//         <video autoPlay loop muted playsInline className="background-video">
//           <source src={process.env.PUBLIC_URL + '/Background.mp4'} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//         <div className="video-overlay"></div>
//       </div>
//       <header className="header">
//         <button className="header-button" onClick={() => navigate('/login')}>Login</button>
//         <button className="header-button">Help</button>
//       </header>
//       <main className="main-content">
//         <h1 className="title">Morse Code Translator</h1>
//         <button className="get-started" onClick={() => getUserDetails(navigate)}>Get Started</button>
//       </main>
//     </div>
//   );
// }

// function SocialLogin() {
//   return (
//     <div className="social-login">
//       <button className="social-button">
//         <img src={googleLogo} alt="Google" className="social-icon" />
//         Google
//       </button>
//       <button className="social-button">
//         <img src={appleLogo} alt="Apple" className="social-icon" />
//         Apple
//       </button>
//     </div>
//   );
// }

// function InputField({ type, placeholder }) {
//   const [isPasswordShown, setIsPasswordShown] = useState(false);
//   return (
//     <div className="input-wrapper">
//       <input
//         type={isPasswordShown ? 'text' : type}
//         placeholder={placeholder}
//         className="input-field"
//         required
//       />
//       {type === 'password' && (
//         <i
//           onClick={() => setIsPasswordShown(!isPasswordShown)}
//           className="material-symbols-rounded eye-icon"
//         >
//           {isPasswordShown ? <FiEyeOff /> : <FiEye />}
//         </i>
//       )}
//     </div>
//   );
// }

// function Login() {
//   const [isSignupMode, setIsSignupMode] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [username, setUsername] = useState('');
//   const navigate = useNavigate();

//   const handleSignUp = async (username, email, password) => {
//     console.log("Function called");  // Check if function is executed
//     console.log("Username:", username);
//     console.log("Email:", email);
//     console.log("Password:", password);
//     const result = await apiCall("signup", "POST", { username, email, password })
//     if (result.status === true) {
//       navigate('/screen')
//     }
//   }

//   const handleLogin = async (email, password) => {
//     const result = await apiCall("login", "POST", { email, password })
//     if (result.status === true) {
//       navigate('/screen')
//     }
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Get values directly from DOM
//     const emailInput = document.querySelector('input[type="email"]');
//     const passwordInput = document.querySelector('input[type="password"]');
//     const usernameInput = isSignupMode ? document.querySelector('input[type="text"]') : null;

//     const formEmail = emailInput ? emailInput.value : '';
//     const formPassword = passwordInput ? passwordInput.value : '';
//     const formUsername = usernameInput ? usernameInput.value : '';

//     console.log("Form values - Email:", formEmail);
//     console.log("Form values - Password:", formPassword);
//     if (isSignupMode) console.log("Form values - Username:", formUsername);

//     isSignupMode
//       ? handleSignUp(formUsername, formEmail, formPassword)
//       : handleLogin(formEmail, formPassword);
//   };

//   return (
//     <div className="login-container">
//       <button className="back-button" onClick={() => navigate('/')}>Back</button>
//       <h2 className="form-title">{isSignupMode ? 'Sign Up' : 'Log In'} with</h2>
//       <SocialLogin />
//       <p className="separator"><span>or</span></p>
//       <form className="login-form" onSubmit={handleSubmit}>
//         {isSignupMode && (
//           <>
//             <InputField type="text" placeholder="Username " value={username} onChange={(e) => setUsername(e.target.value)} required />
//           </>
//         )}
//         <InputField type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         <InputField type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         <button type="submit" className="login-button">
//           {isSignupMode ? 'Sign Up' : 'Log In'}
//         </button>
//       </form>
//       {!isSignupMode && (
//         <p className="signup-prompt">
//           Don&apos;t have an account?
//           <button onClick={() => setIsSignupMode(true)} className="signup-link">Sign up</button>
//         </p>
//       )}
//     </div>
//   );
// }



// export default function Both() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/screen" element={<Screen />}></Route>
//       </Routes>
//     </Router>
//   );
// }


