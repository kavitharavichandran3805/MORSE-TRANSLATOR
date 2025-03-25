
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Screen.css";

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

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      // Add any additional logout logic here (e.g., clearing tokens)
      navigate('/');
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