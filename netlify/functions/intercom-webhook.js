exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only handle POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body || "{}");
    console.log("Webhook received:", body);

    // Extract conversation and user info
    const { type, conversation_id, user_id, admin_id } = body;

    // Your deployed React app URL (update this after deployment)
    const appUrl = process.env.URL || "https://your-app-name.netlify.app";

    // Build the canvas URL with query parameters
    let canvasUrl = appUrl;
    const params = new URLSearchParams();

    if (conversation_id) params.append("conversation_id", conversation_id);
    if (user_id) params.append("user_id", user_id);
    if (admin_id) params.append("admin_id", admin_id);

    if (params.toString()) {
      canvasUrl += "?" + params.toString();
    }

    // Return canvas configuration
    const response = {
      canvas: {
        content_url: canvasUrl,
        height: 600,
        width: 400,
      },
    };

    console.log("Webhook response:", response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Webhook error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
