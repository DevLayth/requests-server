const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000; 
const HOST = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const PHP_ENDPOINT = "https://utilities.uod.ac/utilities/t_control/forRequestsServer.php";
const ANOTHER_ENDPOINT = "https://utilities.uod.ac/utilities/API/taxi_request/requests.php";

const HEADERS = {
    "Content-Type": "application/json",
    "X-API-KEY": "ControlLMmUoD20Sh2300lSH",
};

const POST_HEADERS = {
    "Content-Type": "application/json",
    "X-API-KEY": "LMmUoD20Sh2300lSH",
};

let dataArray = [];
let intervalId = null;

// Enable CORS
app.use(cors());

// Fetch data from PHP endpoint
app.get("/fetch-data", async (req, res) => {
    try {
        const response = await fetch(PHP_ENDPOINT, { headers: HEADERS });
        const data = await response.json();

        if (Array.isArray(data)) {
            dataArray.push(...data);
            console.log("Fetched data:", data);
            res.status(200).json(data);
        } else {
            console.error("Unexpected data format from PHP endpoint:", data);
            res.status(500).json({
                message: "Unexpected data format from PHP endpoint.",
                data: data,
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({
            message: "Failed to fetch data from the PHP endpoint.",
            error: error.message,
        });
    }
});

// Start periodic fetching
app.get("/start-fetching", (req, res) => {
    if (!intervalId) {
        intervalId = setInterval(fetchDataPeriodically, 2000);
        res.status(200).json({ message: "Periodic fetching started." });
        console.log("Periodic fetching started.");
    } else {
        res.status(400).json({ message: "Periodic fetching is already running." });
    }
});

// Stop periodic fetching
app.get("/stop-fetching", (req, res) => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        res.status(200).json({ message: "Periodic fetching stopped." });
        console.log("Periodic fetching stopped.");
    } else {
        res.status(400).json({ message: "Periodic fetching is not running." });
    }
});

// Send data to another endpoint
const sendDataToAnotherEndpoint = async (phone) => {
    try {
        const response = await fetch(ANOTHER_ENDPOINT, {
            method: "POST",
            headers: POST_HEADERS,
            body: JSON.stringify({ phone: phone }),
        });
        const data = await response.json();
        console.log("Data sent to another endpoint:", data);
    } catch (error) {
        console.error("Error sending data to another endpoint:", error.message);
    }
};

// Periodic data fetching logic
const fetchDataPeriodically = async () => {
    try {
        const response = await fetch(`${HOST}/fetch-data`);
        const data = await response.json();
        console.log("Data fetched periodically:", data);

        if (Array.isArray(data)) {
            data.forEach((item) => {
                if (item.phone) {
                    sendDataToAnotherEndpoint(item.phone);
                } else {
                    console.warn("Missing 'phone' in item:", item);
                }
            });
        } else {
            console.error("Unexpected response format during periodic fetch:", data);
        }
    } catch (error) {
        console.error("Error during periodic fetch:", error.message);
    }
};

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on ${HOST}`);
});
