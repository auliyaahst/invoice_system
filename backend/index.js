// index.js (Backend)
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Get all invoices
app.get('/invoices', async (req, res) => {
  try {
    const allInvoices = await pool.query('SELECT * FROM Invoices');
    res.json(allInvoices.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.post('/invoices', async (req, res) => {
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
      'SELECT CustomerID FROM Customers WHERE Name ILIKE $1',
      [customerName]
    );

    if (customerResult.rows.length === 0) {
      // If customer doesn't exist, create new customer
      const newCustomer = await pool.query(
        'INSERT INTO Customers (Name, Email, Phone, Address) VALUES ($1, $2, $3, $4) RETURNING CustomerID',
        [customerName, '', '', ''] // Adding minimal required customer data
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
       RETURNING InvoiceID, CustomerID, InvoiceDate, DueDate, TotalAmount`,
      [customerID, invoiceDate, dueDate, amount]
    );

    // Fetch customer details to include in response
    const customerDetails = await pool.query(
      'SELECT Name as customername FROM Customers WHERE CustomerID = $1',
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

// Get the total number of customers
app.get('/customers/total', async (req, res) => {
  try {
    const totalCustomers = await pool.query('SELECT COUNT(*) FROM Customers');
    res.json(totalCustomers.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// Get the total number of invoices
app.get('/invoices/total', async (req, res) => {
  try {
    const totalInvoices = await pool.query('SELECT COUNT(*) FROM Invoices');
    res.json(totalInvoices.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
