let baseUrl = process.env.REACT_APP_API_BASE_URL || "https://inventory-api.onrender.com";
if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = "https://" + baseUrl;
}
export const API_BASE_URL = baseUrl;
