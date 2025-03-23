import React, { useState } from 'react';
import './Login.css';
import googleLogo from './google.svg';
import appleLogo from './apple.svg';
import { FiEyeOff, FiEye } from 'react-icons/fi';

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

function InputField({ type, placeholder, icon }) {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  return (
    <div className="input-wrapper">
      <input
        type={isPasswordShown ? 'text' : type}
        placeholder={placeholder}
        className="input-field"
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

export default function Login() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const handleSignupClick = () => {
    setIsSignupMode(true);
  };

  return (
    <div className="login-container">
      <h2 className="form-title">{isSignupMode ? 'Sign Up' : 'Log In'} with</h2>
      <SocialLogin />
      <p className="separator"><span>or</span></p>
      <form className="login-form">
        {isSignupMode && (
          <>
            <InputField type="text" placeholder="First Name" />
            <InputField type="text" placeholder="Last Name" />
          </>
        )}
        <InputField type="email" placeholder="Email address" />
        <InputField type="password" placeholder="Password" />
        <button type="submit" className="login-button">
          {isSignupMode ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      {!isSignupMode && (
        <p className="signup-prompt">
          Don&apos;t have an account? 
          <button onClick={handleSignupClick} className="signup-link">
            Sign up
          </button>
        </p>
      )}
    </div>
  );
}








