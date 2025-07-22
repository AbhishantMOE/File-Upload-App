class IntercomService {
  constructor() {
    this.isReady = false;
    this.init();
  }

  init() {
    // Wait for Intercom to be available
    const checkIntercom = () => {
      if (window.Intercom) {
        this.isReady = true;
        this.setupEventListeners();
      } else {
        setTimeout(checkIntercom, 100);
      }
    };
    checkIntercom();
  }

  setupEventListeners() {
    if (!window.Intercom) return;

    // Listen for messenger events
    window.Intercom("onShow", () => {
      console.log("Intercom messenger shown");
    });

    window.Intercom("onHide", () => {
      console.log("Intercom messenger hidden");
    });
  }

  // Send message to Intercom
  sendMessage(message, metadata = {}) {
    if (!this.isReady) {
      console.warn("Intercom not ready");
      return false;
    }

    try {
      window.Intercom("trackEvent", "file-upload-message", {
        message: message,
        timestamp: Date.now(),
        ...metadata,
      });

      // You can also show a message in the messenger
      window.Intercom("showNewMessage", message);
      return true;
    } catch (error) {
      console.error("Error sending message to Intercom:", error);
      return false;
    }
  }

  // Track file upload events
  trackFileUpload(eventType, data = {}) {
    if (!this.isReady) return;

    try {
      window.Intercom("trackEvent", `file-upload-${eventType}`, {
        timestamp: Date.now(),
        ...data,
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  }

  // Get current user info
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error("Intercom not ready"));
        return;
      }

      try {
        // This is a simplified example - actual implementation depends on your setup
        const userInfo = {
          id: "current_user",
          email: "user@example.com",
        };
        resolve(userInfo);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Show messenger
  show() {
    if (this.isReady && window.Intercom) {
      window.Intercom("show");
    }
  }

  // Hide messenger
  hide() {
    if (this.isReady && window.Intercom) {
      window.Intercom("hide");
    }
  }
}

export const intercomService = new IntercomService();
