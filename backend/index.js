// index.js (Backend)
const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Get all products
app.get("/products", async (req, res) => {
  try {
    const allProducts = await pool.query("SELECT * FROM Products");
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Add a new product
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;
    const newProduct = await pool.query(
      "INSERT INTO Products (ProductName, Price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Get all invoices with customer names and created_at timestamp
app.get("/invoices", async (req, res) => {
  try {
    const allInvoices = await pool.query(`
      SELECT i.InvoiceID, c.Name as customername, i.InvoiceDate, i.TotalAmount, i.created_at
      FROM Invoices i
      JOIN Customers c ON i.CustomerID = c.CustomerID
    `);
    res.json(allInvoices.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/invoices", async (req, res) => {
  try {
    const { customerName, invoiceDate, amount } = req.body;

    // Input validation
    if (!customerName || !invoiceDate || !amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Calculate due date (e.g., 30 days from invoice date)
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // First, check if customer exists
    const customerResult = await pool.query(
      "SELECT CustomerID FROM Customers WHERE Name ILIKE $1",
      [customerName]
    );

    let customerID;
    if (customerResult.rows.length === 0) {
      // If customer doesn't exist, create new customer
      const newCustomer = await pool.query(
        "INSERT INTO Customers (Name, Email, Phone, Address) VALUES ($1, $2, $3, $4) RETURNING CustomerID",
        [customerName, "", "", ""] // Adding minimal required customer data
      );
      customerID = newCustomer.rows[0].customerid;
    } else {
      customerID = customerResult.rows[0].customerid;
    }

    // Insert new invoice with all required fields
    const newInvoice = await pool.query(
      `INSERT INTO Invoices 
       (CustomerID, InvoiceDate, DueDate, TotalAmount) 
       VALUES ($1, $2, $3, $4) 
       RETURNING InvoiceID, CustomerID, InvoiceDate, DueDate, TotalAmount, created_at`,
      [customerID, invoiceDate, dueDate, amount]
    );

    // Fetch customer details to include in response
    const customerDetails = await pool.query(
      "SELECT Name as customername FROM Customers WHERE CustomerID = $1",
      [customerID]
    );

    // Combine invoice and customer data for response
    const responseData = {
      ...newInvoice.rows[0],
      customername: customerDetails.rows[0].customername,
      amount: newInvoice.rows[0].totalamount // Align with frontend expectations
    };

    res.status(201).json(responseData);
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.post("/invoices/new", async (req, res) => {
  try {
    const { customerName, invoiceDate, amount } = req.body;

    // Input validation
    if (!customerName || !invoiceDate || !amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Calculate due date (e.g., 30 days from invoice date)
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // Check if customer exists
    const customerResult = await pool.query(
      "SELECT CustomerID FROM Customers WHERE Name ILIKE $1",
      [customerName]
    );

    let customerID;
    if (customerResult.rows.length === 0) {
      // Create a new customer if one does not exist
      const newCustomer = await pool.query(
        "INSERT INTO Customers (Name, Email, Phone, Address) VALUES ($1, $2, $3, $4) RETURNING CustomerID",
        [customerName, "", "", ""]
      );
      customerID = newCustomer.rows[0].customerid;
    } else {
      customerID = customerResult.rows[0].customerid;
    }

    // Insert a new invoice
    const newInvoice = await pool.query(
      `INSERT INTO Invoices (CustomerID, InvoiceDate, DueDate, TotalAmount)
       VALUES ($1, $2, $3, $4) RETURNING InvoiceID`,
      [customerID, invoiceDate, dueDate, amount]
    );

    // Return the newly created invoiceID
    res.status(201).json({ invoiceID: newInvoice.rows[0].invoiceid });
  } catch (err) {
    console.error("Error creating invoice:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// create invoiceDetails from passing the invoiceID, productID, quantity, taxID
app.post("/invoiceDetails", async (req, res) => {
  try {
    const { invoiceID, productID, quantity, taxID } = req.body;
    const product = await pool.query(
      "SELECT Price FROM Products WHERE ProductID = $1",
      [productID]
    );
    const lineTotal = product.rows[0].price * quantity;

    await pool.query(
      `INSERT INTO InvoiceDetails 
       (InvoiceID, ProductID, Quantity, TaxID, LineTotal) 
       VALUES ($1, $2, $3, $4, $5)`,
      [invoiceID, productID, quantity, taxID, lineTotal]
    );

    res.status(201).json({ message: "Invoice details added successfully" });
  } catch (err) {
    console.error(err.message);
  }
});

// Get detailed view for a specific invoice
app.get("/invoices/:invoiceID/details", async (req, res) => {
  const { invoiceID } = req.params;
  try {
    const invoiceDetails = await pool.query(
      `SELECT p.ProductName, id.Quantity, p.Price, id.LineTotal
       FROM InvoiceDetails id
       JOIN Products p ON id.ProductID = p.ProductID
       WHERE id.InvoiceID = $1`,
      [invoiceID]
    );
    res.json(invoiceDetails.rows);
  } catch (err) {
    console.error("Error retrieving invoice details:", err.message);
    res.status(500).json({ error: "Failed to retrieve invoice details" });
  }
});

// app.get("/invoiceDetails/:invoiceID", async (req, res) => {
//   try {
//     const { invoiceID } = req.params;
//     const invoiceDetails = await pool.query(
//       `SELECT p.ProductName, id.Quantity, id.LineTotal
//        FROM InvoiceDetails id
//        JOIN Products p ON id.ProductID = p.ProductID
//        WHERE id.InvoiceID = $1`,
//       [invoiceID]
//     );
//     res.json(invoiceDetails.rows);
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// Get the total number of customers
app.get("/customers/total", async (req, res) => {
  try {
    const totalCustomers = await pool.query("SELECT COUNT(*) FROM Customers");
    res.json(totalCustomers.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Get the total number of invoices
app.get("/invoices/total", async (req, res) => {
  try {
    const totalInvoices = await pool.query("SELECT COUNT(*) FROM Invoices");
    res.json(totalInvoices.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
