import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Screen.css";

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


const Screen = () => {
  const [isBlack, setIsBlack] = useState(false);
  const [socket, setSocket] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [frame, setFrame] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/morse/");

    ws.onopen = () => {
      console.log("Connection opened");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.translation) {
        setTranslatedText(data.translation);
      }

      if (data.frame) {
        setFrame(`data:image/jpeg;base64,${data.frame}`);
      }

      if (data.status === "stopped") {
        setIsBlack(false);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
      setSocket(null);
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleStart = () => {
    if (socket) {
      socket.send(JSON.stringify({ "command": "start" }));
      setTranslatedText("");
    }
    setIsBlack(true);
  };

  const handleStop = () => {
    if (socket) {
      console.log("Sending stop command...");
      socket.send(JSON.stringify({ "command": "stop" }));
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    try {
      if (confirmLogout) {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        console.log(accessToken)
        const result = await apiCall("logout", "POST", { refresh: refreshToken }, accessToken)
        if (result.status) {
          navigate('/');
        }
        else {
          alert("Failed to logout")
        }

      }
    }
    catch (error) {
      alert("Error in logging out!!!")
    }
    setShowLogout(false);
  };

  const handleCircleClick = () => {
    setShowLogout(!showLogout);
  };

  return (
    <div className="containerScreen">
      <div className="logout-circle" onClick={handleCircleClick}>
        U
        {showLogout && (
          <div className="logout-dropdown">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
      <button className="back-button" onClick={handleBack}>Back</button>
      <div className="instructions">
        <h2>Morse Translator</h2>
      </div>

      <div className="content">
        <div className="screen-container">
          <div className={`black-screen ${isBlack ? "active" : ""}`}>
            {frame && <img src={frame} alt="Camera Feed" className="black-screen" />}
          </div>
          <div className="buttons">
            <button onClick={() => handleStart()}>Start</button>
            <button onClick={() => handleStop()}>Stop</button>
          </div>
        </div>
        <div className="right-section">
          <div className="section">
            <h3>Instructions</h3>
            <p>Content goes here...</p>
          </div>
          <div className="section">
            <h3>Translated Text</h3>
            <textarea value={translatedText} placeholder="Enter text here..."></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen;