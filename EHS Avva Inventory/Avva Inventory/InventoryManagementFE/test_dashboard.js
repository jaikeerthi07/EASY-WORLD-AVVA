const axios = require('axios');

async function testFetch() {
    const API_BASE_URL = "http://127.0.0.1:5000";
    try {
        console.log("Fetching product stats...");
        const pStats = await axios.get(`${API_BASE_URL}/api/products/statistics`);
        console.log("Product stats OK");
        console.log(pStats.data);

        console.log("Fetching billing stats...");
        const bStats = await axios.get(`${API_BASE_URL}/api/billing/statistics`);
        console.log("Billing stats OK");
        console.log(bStats.data);

        console.log("Fetching low stock...");
        const lStock = await axios.get(`${API_BASE_URL}/api/products?per_page=100`);
        console.log("Low stock OK");
        console.log(lStock.data);

        // Simulate frontend logic
        const allProducts = lStock.data.items || [];
        const lowStockProducts = allProducts.filter(product => product.quantity < 10);
        console.log("Low stock logic OK:", lowStockProducts.length);

        console.log("SUCCESS");
    } catch (err) {
        if (err.response) {
            console.error("HTTP Error:", err.response.status, err.response.data);
        } else {
            console.error("Fetch Error:", err.message);
        }
    }
}

testFetch();
