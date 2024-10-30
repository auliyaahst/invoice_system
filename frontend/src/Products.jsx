import React, { useState, useEffect } from 'react';
import './products.css';

const Products = ({ onAddToInvoice }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: 0 });
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setProducts([...products, data]);
        setShowNewProductModal(false);
        setFormData({ name: '', price: 0 });

        fetchProducts();
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    }
  };

  return (
    <div className="products">
      <h1 className="text-xl font-bold">Products</h1>

      <div className="grid grid-cols-3 gap-4 my-4">
        {products.map((product) => (
          <div key={product.productid} className="product-card">
            <h3 className="product-name">{product.productname}</h3>
            <p className="product-price">Price: {product.price}</p>
            {/* <button
              className="add-to-invoice-btn"
              onClick={() => onAddToInvoice(product)}
            >
              Add to Invoice
            </button> */}
          </div>
        ))}
      </div>

      <button
        className="new-product-btn"
        onClick={() => setShowNewProductModal(true)}
      >
        Add New Product
      </button>

      {showNewProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-bold mb-4 text-center">New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="block mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="block mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  required
                  className="input-field"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setShowNewProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
