exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Get the current site URL
    const siteUrl = `https://${event.headers.host}`;

    // Build canvas URL with parameters
    let canvasUrl = siteUrl;
    const params = new URLSearchParams();

    if (body.conversation_id)
      params.append("conversation_id", body.conversation_id);
    if (body.user_id) params.append("user_id", body.user_id);

    if (params.toString()) {
      canvasUrl += "?" + params.toString();
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        canvas: {
          content_url: canvasUrl,
          height: 500,
          width: 350,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
