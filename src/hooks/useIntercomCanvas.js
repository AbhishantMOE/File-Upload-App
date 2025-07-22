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
    // Check if we're in a canvas (has query parameters or is in iframe)
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation_id");
    const userId = urlParams.get("user_id");
    const adminId = urlParams.get("admin_id");
    const isInIframe = window.parent !== window;

    const isCanvas = !!(conversationId || userId || isInIframe);

    setCanvasData({
      conversationId,
      userId,
      adminId,
      isCanvas,
      isReady: true,
    });

    console.log("Canvas context:", {
      conversationId,
      userId,
      adminId,
      isCanvas,
      url: window.location.href,
    });
  }, []);

  return canvasData;
};
