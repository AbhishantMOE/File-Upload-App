import React, { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import { intercomService } from "./services/intercomService";
import "./App.css";

function App() {
  const [isIntercomReady, setIsIntercomReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Initialize Intercom integration
    const initializeIntercom = () => {
      if (window.Intercom) {
        window.Intercom("onShow", () => {
          setIsIntercomReady(true);
        });

        window.Intercom("onHide", () => {
          setIsIntercomReady(false);
        });

        // Get current user info if available
        intercomService
          .getCurrentUser()
          .then((user) => setCurrentUser(user))
          .catch(console.error);
      }
    };

    // Wait for Intercom to load
    const checkIntercom = setInterval(() => {
      if (window.Intercom) {
        initializeIntercom();
        clearInterval(checkIntercom);
      }
    }, 100);

    return () => clearInterval(checkIntercom);
  }, []);

  return (
    <div className="app">
      <div className="app-header">
        <h1>File Upload</h1>
        <p>Upload your files through our secure system</p>
      </div>

      <div className="app-content">
        <FileUpload
          isIntercomReady={isIntercomReady}
          currentUser={currentUser}
        />
      </div>

      {!isIntercomReady && (
        <div className="intercom-status">
          <p>Connecting to support...</p>
        </div>
      )}
    </div>
  );
}

export default App;
