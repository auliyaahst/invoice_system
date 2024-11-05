import React, { useState, useEffect } from "react";
import "./products.css";

const navigation = [
  { name: "Dashboard", href: "/", current: false },
  { name: "Products", href: "/products", current: true }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: 0 });
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [cart, setCart] = useState([]);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleAddProduct = async e => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setProducts([...products, data]);
        setShowNewProductModal(false);
        setFormData({ name: "", price: 0 });
        fetchProducts();
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Failed to add product. Please try again.");
    }
  };

  const addToCart = product => {
    setCart(currentCart => {
      const existingItem = currentCart.find(
        item => item.productid === product.productid
      );

      if (existingItem) {
        return currentCart.map(
          item =>
            item.productid === product.productid
              ? { ...item, quantity: item.quantity + 1 }
              : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(currentCart =>
      currentCart.map(
        item => (item.productid === productId ? { ...item, quantity } : item)
      )
    );
  };

  const removeFromCart = productId => {
    setCart(currentCart =>
      currentCart.filter(item => item.productid !== productId)
    );
  };

  const getCartQuantity = productId => {
    const cartItem = cart.find(item => item.productid === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(amount);
  };

  const handleCreateInvoice = async e => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Please add at least one product to the cart");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/invoices/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          invoiceDate: new Date().toISOString(),
          amount: calculateTotal()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      const newInvoiceID = data.invoiceID;

      for (const product of cart) {
        const resDetail = await fetch("http://localhost:5000/invoiceDetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceID: newInvoiceID,
            productID: product.productid,
            quantity: product.quantity,
            taxID: 1
          })
        });

        if (!resDetail.ok) {
          const detailData = await resDetail.json();
          setError(detailData.error);
          return;
        }
      }

      setCreateInvoice(cart, calculateTotal());
      setCart([]);
      setShowCart(false);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError("Failed to create invoice. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-slate-50 dark:text-slate-200 mb-4">Products</h1>
        <div className="fixed top-4 right-4 z-10">
          <button
            onClick={() => setShowCart(!showCart)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
          >
            🛒 Cart
            {cart.length > 0 &&
              <span className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {cart.length}
              </span>}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => {
            const cartQuantity = getCartQuantity(product.productid);

            return (
              <div
                key={product.productid}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">
                  {product.productname}
                </h3>
                <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">
                  {formatCurrency(product.price)}
                </p>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add to Cart
                  </button>
                  {cartQuantity > 0 &&
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {cartQuantity} in cart
                    </span>}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="new-product-btn mt-4"
          onClick={() => setShowNewProductModal(true)}
        >
          Add New Product
        </button>

        {showNewProductModal &&
          <div className="modal-overlay">
            <div className="modal-content bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-center">New Product</h2>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label className="block mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-field bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="form-group">
                  <label className="block mb-2">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value)
                      })}
                    required
                    className="input-field bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          </div>}

        {showCart &&
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-lg z-20 transform transition-transform duration-300">
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex-grow overflow-auto">
                {cart.length === 0
                  ? <p className="text-gray-500 text-center dark:text-gray-300">Cart is empty</p>
                  : <div className="space-y-4">
                      {cart.map(item =>
                        <div
                          key={item.productid}
                          className="bg-gray-50 dark:bg-gray-700 p-3 rounded"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {item.productname}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.productid)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productid,
                                    item.quantity - 1
                                  )}
                                className="bg-gray-200 dark:bg-gray-600 px-2 rounded"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-gray-900 dark:text-gray-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productid,
                                    item.quantity + 1
                                  )}
                                className="bg-gray-200 dark:bg-gray-600 px-2 rounded"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>}
              </div>

              <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>

                {error &&
                  <div className="text-red-500 mb-4 text-center">
                    {error}
                  </div>}

                <button
                  onClick={() => setShowCreateInvoice(true)}
                  disabled={cart.length === 0}
                  className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  Create Invoice
                </button>
                {error &&
                  <p>
                    {error}
                  </p>}
              </div>

              {showCreateInvoice &&
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
                      Invoice
                    </h2>
                    <form onSubmit={handleCreateInvoice}>
                      <div className="form-group">
                        <label className="block mb-2 text-gray-900 dark:text-gray-100">Customer Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e =>
                            setFormData({ ...formData, name: e.target.value })}
                          required
                          className="input-field"
                        />
                      </div>
                      <div className="modal-actions">
                        <button
                          type="button"
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                          onClick={() => setShowCreateInvoice(false)}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateInvoice}
                          type="submit"
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>}
            </div>
          </div>}
      </div>
    </div>
  );
};

export default Products;