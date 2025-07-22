import { useState, useEffect } from "react";

export const useIntercomCanvas = () => {
  const [canvasData, setCanvasData] = useState({
    conversationId: null,
    userId: null,
    adminId: null,
    isCanvas: false,
    isReady: false,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation_id");
    const userId = urlParams.get("user_id");
    const adminId = urlParams.get("admin_id");
    const isInIframe = window.parent !== window;
    const debugMode = urlParams.get("debug") === "intercom";

    const isCanvas = !!(conversationId || userId || isInIframe || debugMode);

    setCanvasData({
      conversationId,
      userId,
      adminId,
      isCanvas,
      isReady: true,
    });

    // Log canvas detection
    console.log("🎨 Canvas detection:", {
      conversationId,
      userId,
      adminId,
      isCanvas,
      isInIframe,
      debugMode,
      url: window.location.href,
    });

    // Notify parent if in canvas
    if (isCanvas) {
      window.parent.postMessage(
        {
          type: "canvas_initialized",
          data: { conversationId, userId, adminId },
        },
        "*"
      );
    }
  }, []);

  return canvasData;
};
