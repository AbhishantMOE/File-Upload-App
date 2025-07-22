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
      });
    } else if (canvasData.isReady && !canvasData.isCanvas) {
      // Regular Intercom integration for standalone mode
      intercomService
        .getCurrentUser()
        .then((user) => setCurrentUser(user))
        .catch(console.error);
    }
  }, [canvasData]);

  return (
    <div className="app">
      {/* Canvas indicator */}
      {canvasData.isCanvas && (
        <div className="canvas-indicator">
          <small>🔗 Connected to conversation</small>
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
        <div
          style={{
            position: "fixed",
            bottom: 10,
            left: 10,
            background: "#333",
            color: "white",
            padding: 10,
            borderRadius: 4,
            fontSize: 12,
            maxWidth: 300,
          }}
        >
          <strong>Debug Info:</strong>
          <br />
          Canvas: {canvasData.isCanvas ? "Yes" : "No"}
          <br />
          Conversation: {canvasData.conversationId || "None"}
          <br />
          User: {canvasData.userId || "None"}
        </div>
      )}
    </div>
  );
}

export default App;
