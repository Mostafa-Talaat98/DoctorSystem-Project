import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com",
  PAYPAL_RETURN_URL,
  PAYPAL_CANCEL_URL,
} = process.env;

const getAccessToken = async () => {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not defined in environment variables");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error.response?.data || error.message);
    throw new Error("Failed to generate Access Token");
  }
};

export const createPayPalOrder = async ({ amount, description }) => {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            description: description,
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
          },
        ],
        application_context: {
          return_url: PAYPAL_RETURN_URL,
          cancel_url: PAYPAL_CANCEL_URL,
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create order:", error.response?.data || error.message);
    throw new Error("Failed to create order");
  }
};

export const capturePayPalOrder = async (orderId) => {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to capture order:", error.response?.data || error.message);
    throw new Error("Failed to capture order");
  }
};
