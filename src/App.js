import React, { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import { useIntercomCanvas } from "./hooks/useIntercomCanvas";
import { intercomService } from "./services/intercomService";
import "./App.css";

function App() {
  const canvasData = useIntercomCanvas();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // If we have user ID from canvas, use it
    if (canvasData.userId) {
      setCurrentUser({
        id: canvasData.userId,
        conversation_id: canvasData.conversationId,
        admin_id: canvasData.adminId,
      });
    } else if (canvasData.isReady && !canvasData.isCanvas) {
      // Regular Intercom integration for standalone mode
      intercomService
        .getCurrentUser()
        .then((user) => setCurrentUser(user))
        .catch(console.error);
    }
  }, [canvasData]);

  // Add canvas-mode class when in canvas
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

      {!canvasData.isReady && (
        <div className="intercom-status">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}

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
          Window Width:{" "}
          {typeof window !== "undefined" ? window.innerWidth : "Unknown"}px
          <br />
          URL:{" "}
          {typeof window !== "undefined"
            ? window.location.href.substring(0, 50) + "..."
            : "Unknown"}
        </div>
      )}
    </div>
  );
}

export default App;
