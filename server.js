const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

const PHP_ENDPOINT = "https://utilities.uod.ac/utilities/t_control/forRequestsServer.php";

let dataArray = [];
let intervalId = null;

app.get("/fetch-data", async (req, res) => {
    try {
        const response = await axios.get(PHP_ENDPOINT, { headers: { "Content-Type": 'application/json', "X-API-KEY": 'ControlLMmUoD20Sh2300lSH', }, });

        dataArray.push(response.data);

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching data:", error.message);

        res.status(500).json({
            message: "Failed to fetch data from the PHP endpoint.",
            errorMessage: error.message,
        });
    }
});

app.get("/start-fetching", (req, res) => {
    if (!intervalId) {
        intervalId = setInterval(fetchDataPeriodically, 2000);
        res.status(200).json({ message: "Periodic fetching started." });
    } else {
        res.status(400).json({ message: "Periodic fetching is already running." });
    }
});

app.get("/stop-fetching", (req, res) => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        res.status(200).json({ message: "Periodic fetching stopped." });
    } else {
        res.status(400).json({ message: "Periodic fetching is not running." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const sendDataToAnotherEndpoint = async (phone) => {
    try {
        const response = await axios.post("https://utilities.uod.ac/utilities/API/taxi_request/requests.php", {
            phone: phone
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": 'LMmUoD20Sh2300lSH',
            },
        });
        console.log("Data sent to another endpoint:", response.data);
    } catch (error) {
        console.error("Error sending data to another endpoint:", error.message);
    }
};

const fetchDataPeriodically = async () => {
    try {
        const response = await axios.get(`http://localhost:${PORT}/fetch-data`);
        console.log("Taxi Requested:", response.data);
        response.data.forEach((item) => {
            sendDataToAnotherEndpoint(item.phone);
        });
    } catch (error) {
        console.error("Error during periodic fetch:", error.message);
    }
};