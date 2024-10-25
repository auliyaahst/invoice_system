import React, { useState, useEffect } from 'react';
import './index.css';

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    invoiceDate: '',
    amount: ''
  });
  const [error, setError] = useState('');

  // Fetch initial data for dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const customerRes = await fetch('http://localhost:5000/customers');
      const customers = await customerRes.json();
      setTotalCustomers(customers.length);

      const invoiceRes = await fetch('http://localhost:5000/invoices');
      const invoicesData = await invoiceRes.json();
      setInvoices(invoicesData);
      setTotalInvoices(invoicesData.length);
    } catch (err) {
      console.error('Error fetching dashboard data:', err.message);
      setError('Failed to load dashboard data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          invoiceDate: formData.invoiceDate,
          amount: parseFloat(formData.amount)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Add new invoice to the list and update totals
        setInvoices([data, ...invoices]);
        setTotalInvoices(prev => prev + 1);
        setShowModal(false);
        setFormData({ customerName: '', invoiceDate: '', amount: '' });
        
        // Refresh dashboard data to ensure everything is in sync
        fetchDashboardData();
      } else {
        setError(data.error || 'Failed to save invoice');
      }
    } catch (err) {
      console.error('Error submitting form:', err.message);
      setError('Failed to save invoice. Please try again.');
    }
  };
  
  return (
    <div className="dashboard">
      <h1 className="text-xl font-bold">Invoice System</h1>

      {/* Total Customers and Total Invoices */}
      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <i className="fas fa-users text-2xl"></i>
            <div className="ml-4">
              <h2 className="text-lg">Total Customers</h2>
              <p className="text-xl">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center">
            <i className="fas fa-file-invoice text-2xl"></i>
            <div className="ml-4">
              <h2 className="text-lg">Total Invoices</h2>
              <p className="text-xl">{totalInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Recent Invoices</h2>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="border px-4 py-2">Invoice ID</th>
              <th className="border px-4 py-2">Customer</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-2">No invoices yet</td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.invoiceid}>
                  <td className="border px-4 py-2">{invoice.invoiceid}</td>
                  <td className="border px-4 py-2">{invoice.customername}</td>
                  <td className="border px-4 py-2">{invoice.invoicedate}</td>
                  <td className="border px-4 py-2">{invoice.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Invoice Button */}
      <div className="my-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowModal(true)}
        >
          New Invoice
        </button>
      </div>

      {/* Modal for New Invoice */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-8 rounded shadow">
            <h2 className="text-lg font-bold mb-4">New Invoice</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Invoice Date</label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
