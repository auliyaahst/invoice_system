import React, { useState, useEffect } from "react";
import "./index.css";

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch initial data for dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const customerRes = await fetch("http://localhost:5000/customers/total");
      const totalCustomersData = await customerRes.json();
      setTotalCustomers(totalCustomersData.count);

      const invoiceRes = await fetch("http://localhost:5000/invoices");
      const invoicesData = await invoiceRes.json();
      setInvoices(invoicesData);
      setTotalInvoices(invoicesData.length);

      const revenue = invoicesData.reduce(
        (acc, invoice) => acc + Number(invoice.totalamount),
        0
      );
      setTotalRevenue(revenue.toFixed(2));
    } catch (err) {
      console.error("Error fetching dashboard data:", err.message);
    }
  };

  const fetchInvoiceDetails = async (invoiceID) => {
    try {
      const response = await fetch(`/invoices/${invoiceID}/details`);
      const data = await response.json();
      setInvoiceDetails(data);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  useEffect(() => {
    if (selectedInvoice && selectedInvoice.invoiceid) {
      fetchInvoiceDetails(selectedInvoice.invoiceid);
    }
  }, [selectedInvoice]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewInvoiceModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Invoice System</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <h2 className="text-lg text-gray-700 dark:text-gray-300">Total Customers</h2>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalCustomers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <h2 className="text-lg text-gray-700 dark:text-gray-300">Total Invoices</h2>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalInvoices}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <h2 className="text-lg text-gray-700 dark:text-gray-300">Total Revenue</h2>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-gray-600 dark:text-gray-300">Invoice ID</th>
                  <th className="px-4 py-2 border-b text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="px-4 py-2 border-b text-gray-600 dark:text-gray-300">Date</th>
                  <th className="px-4 py-2 border-b text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-4 py-2 border-b text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-600 dark:text-gray-400">No invoices yet</td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.invoiceid} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="border px-4 py-2 text-gray-800 dark:text-gray-200">{invoice.invoiceid}</td>
                      <td className="border px-4 py-2 text-gray-800 dark:text-gray-200">{invoice.customername}</td>
                      <td className="border px-4 py-2 text-gray-800 dark:text-gray-200">{formatDateTime(invoice.created_at)}</td>
                      <td className="border px-4 py-2 text-gray-800 dark:text-gray-200">{formatCurrency(invoice.totalamount)}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Viewing Invoice */}
        {showViewInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50 p-4 sm:p-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Invoice ID:</p>
                  <p className="text-gray-800 dark:text-gray-200">{selectedInvoice.invoiceid}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Customer Name:</p>
                  <p className="text-gray-800 dark:text-gray-200">{selectedInvoice.customername}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Invoice Date:</p>
                  <p className="text-gray-800 dark:text-gray-200">{formatDateTime(selectedInvoice.invoicedate)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-300">Amount:</p>
                  <p className="text-gray-800 dark:text-gray-200">{formatCurrency(selectedInvoice.totalamount)}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setShowViewInvoiceModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
