class IntercomService {
  constructor() {
    this.isCanvas = this.detectCanvasMode();
    this.isReady = true; // Always ready for canvas mode
    console.log("IntercomService initialized - Canvas mode:", this.isCanvas);
  }

  detectCanvasMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return !!(
      urlParams.get("conversation_id") ||
      urlParams.get("user_id") ||
      window.parent !== window ||
      urlParams.get("debug") === "intercom"
    );
  }

  // Send message to parent Intercom frame
  sendMessage(message, metadata = {}) {
    try {
      if (this.isCanvas) {
        // Send to parent Intercom frame
        window.parent.postMessage(
          {
            type: "intercom_canvas_message",
            data: {
              message: message,
              metadata: metadata,
              timestamp: Date.now(),
            },
          },
          "*"
        );
        console.log("📤 Message sent to Intercom:", message);
        return true;
      } else {
        // Standalone mode - just log
        console.log("📝 Standalone message:", message);
        return true;
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  }

  // Track file upload events
  trackFileUpload(eventType, data = {}) {
    try {
      const eventData = {
        event: `file_upload_${eventType}`,
        properties: {
          timestamp: Date.now(),
          is_canvas: this.isCanvas,
          ...data,
        },
      };

      if (this.isCanvas) {
        window.parent.postMessage(
          {
            type: "intercom_canvas_event",
            data: eventData,
          },
          "*"
        );
      }

      console.log("📊 Event tracked:", eventData);
    } catch (error) {
      console.error("❌ Error tracking event:", error);
    }
  }

  // Get user info from URL params (canvas mode)
  getCurrentUser() {
    return new Promise((resolve) => {
      const urlParams = new URLSearchParams(window.location.search);

      const userInfo = {
        id: urlParams.get("user_id") || "anonymous",
        conversation_id: urlParams.get("conversation_id"),
        admin_id: urlParams.get("admin_id"),
        is_canvas: this.isCanvas,
      };

      console.log("👤 Current user:", userInfo);
      resolve(userInfo);
    });
  }

  // Notify parent that canvas is ready
  notifyCanvasReady() {
    if (this.isCanvas) {
      setTimeout(() => {
        window.parent.postMessage(
          {
            type: "intercom_canvas_ready",
            data: {
              ready: true,
              url: window.location.href,
              timestamp: Date.now(),
            },
          },
          "*"
        );
        console.log("✅ Canvas ready notification sent");
      }, 500);
    }
  }

  // Resize canvas height
  resizeCanvas(height) {
    if (this.isCanvas) {
      window.parent.postMessage(
        {
          type: "intercom_canvas_resize",
          data: { height: Math.max(height, 400) },
        },
        "*"
      );
      console.log("📐 Canvas resize requested:", height);
    }
  }
}

export const intercomService = new IntercomService();
