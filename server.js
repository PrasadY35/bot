const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

const CSV_FILE = "stock.csv";

// Function to read CSV file
function readStockData() {
    return new Promise((resolve, reject) => {
        const stockData = [];
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on("data", (row) => {
                console.log("Row Read:", row);  // Debugging Log
                stockData.push(row);
            })
            .on("end", () => resolve(stockData))
            .on("error", (err) => reject(err));
    });
}


// API to Get All Stock Data (For AI & Customers)
app.get("/api/stock", async (req, res) => {
    try {
        const stockData = await readStockData();
        res.json(stockData);
    } catch (error) {
        res.status(500).json({ message: "Error reading stock data" });
    }
});

// API to Add New Stock Item (For Admin)
app.post("/api/stock", (req, res) => {
    const { name, quantity, description } = req.body;

    if (!name || !quantity || !description) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const newStock = `\n${name},${quantity},${description}`;

    fs.appendFile(CSV_FILE, newStock, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error adding stock" });
        }
        res.json({ message: "Stock item added successfully!" });
    });
});

// Serve the index.html file when accessing the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API to Update Stock Item
app.put("/api/stock/:name", async (req, res) => {
    const { name, quantity, description } = req.body;

    fs.readFile(CSV_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ message: "Error reading stock data" });

        let stockData = data.split("\n").map(row => row.split(","));
        let header = stockData[0]; // First row (headers)
        stockData = stockData.slice(1); // Remove headers

        const updatedStockData = stockData.map(item => {
            if (item[0] === req.params.name) {
                return [name, quantity, description]; // Update row
            }
            return item;
        });

        const updatedCSV = [header.join(",")].concat(updatedStockData.map(row => row.join(","))).join("\n");

        fs.writeFile(CSV_FILE, updatedCSV, (err) => {
            if (err) return res.status(500).json({ message: "Error updating stock" });
            res.json({ message: "Stock item updated!" });
        });
    });
});

// API to Delete Stock Item
app.delete("/api/stock/:name", (req, res) => {
    fs.readFile(CSV_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ message: "Error reading stock data" });

        let stockData = data.split("\n").map(row => row.split(","));
        let header = stockData[0]; // First row (headers)
        stockData = stockData.slice(1).filter(item => item[0] !== req.params.name); // Remove the deleted item

        const updatedCSV = [header.join(",")].concat(stockData.map(row => row.join(","))).join("\n");

        fs.writeFile(CSV_FILE, updatedCSV, (err) => {
            if (err) return res.status(500).json({ message: "Error deleting stock" });
            res.json({ message: "Stock item deleted!" });
        });
    });
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} 🚀`));
