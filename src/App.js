import React, { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import { useIntercomCanvas } from "./hooks/useIntercomCanvas";
import { intercomService } from "./services/intercomService";
import "./App.css";

function App() {
  const canvasData = useIntercomCanvas();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user info
    intercomService
      .getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        console.log("👤 User set:", user);
      })
      .catch(console.error);

    // Notify canvas ready
    if (canvasData.isCanvas && canvasData.isReady) {
      intercomService.notifyCanvasReady();
    }
  }, [canvasData]);

  const appClasses = `app ${canvasData.isCanvas ? "canvas-mode" : ""}`;

  return (
    <div className={appClasses}>
      {/* Canvas indicator */}
      {canvasData.isCanvas && (
        <div className="canvas-indicator">
          🔗 Connected to conversation
          {canvasData.conversationId && (
            <div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.8 }}>
              ID: {canvasData.conversationId.substring(0, 8)}...
            </div>
          )}
        </div>
      )}

      <div className="app-header">
        <h1>📁 File Upload</h1>
        <p>Upload your files securely</p>
      </div>

      <div className="app-content">
        <FileUpload
          isIntercomReady={canvasData.isReady}
          currentUser={currentUser}
          canvasData={canvasData}
          isCanvas={canvasData.isCanvas}
        />
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="debug-info">
          <strong>Debug Info:</strong>
          <br />
          Canvas: {canvasData.isCanvas ? "Yes" : "No"}
          <br />
          Conversation: {canvasData.conversationId || "None"}
          <br />
          User: {canvasData.userId || "None"}
          <br />
          Admin: {canvasData.adminId || "None"}
          <br />
          Window Width: {window.innerWidth}px
          <br />
          Ready: {canvasData.isReady ? "Yes" : "No"}
        </div>
      )}
    </div>
  );
}

export default App;
