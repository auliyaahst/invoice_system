// Products.jsx
import React, { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import "./products.css";

const navigation = [
  { name: "Dashboard", href: "/", current: false },
  { name: "Products", href: "/products", current: true},
  // { name: 'Projects', href: '#', current: false },
  // { name: 'Calendar', href: '#', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Products = ({ onCreateInvoice }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: 0 });
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [cart, setCart] = useState([]);
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
        body: JSON.stringify(formData),
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
      currency: "IDR",
    }).format(amount);
  };

  const handleCreateInvoice = () => {
    if (cart.length === 0) {
      setError("Please add at least one product to the cart");
      return;
    }
    onCreateInvoice(cart, calculateTotal());
    setCart([]); // Clear cart after creating invoice
    setShowCart(false);
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img
                alt="Your Company"
                src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map(item =>
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
      <div className="relative">
        <h1 className="text-xl font-bold text-slate-50">Products</h1>
        {/* Cart Button with Badge */}
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

        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-4 p-4">
          {products.map(product => {
            const cartQuantity = getCartQuantity(product.productid);

            return (
              <div
                key={product.productid}
                className="bg-white p-4 rounded shadow"
              >
                <h3 className="font-bold mb-2">
                  {product.productname}
                </h3>
                <p className="text-lg mb-2">
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
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {cartQuantity} in cart
                    </span>}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="new-product-btn"
          onClick={() => setShowNewProductModal(true)}
        >
          Add New Product
        </button>

        {/* New Product Modal */}
        {showNewProductModal &&
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="text-2xl font-bold mb-4 text-center">
                New Product
              </h2>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label className="block mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-field"
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
                        price: parseFloat(e.target.value),
                      })}
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
          </div>}

        {/* Cart Slide-out */}
        {showCart &&
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-20 transform transition-transform duration-300">
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex-grow overflow-auto">
                {cart.length === 0
                  ? <p className="text-gray-500 text-center">Cart is empty</p>
                  : <div className="space-y-4">
                      {cart.map(item =>
                        <div
                          key={item.productid}
                          className="bg-gray-50 p-3 rounded"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">
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
                                className="bg-gray-200 px-2 rounded"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productid,
                                    item.quantity + 1
                                  )}
                                className="bg-gray-200 px-2 rounded"
                              >
                                +
                              </button>
                            </div>
                            <span>
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>

                {error &&
                  <div className="text-red-500 mb-4 text-center">
                    {error}
                  </div>}

                <button
                  onClick={handleCreateInvoice}
                  disabled={cart.length === 0}
                  className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>}
      </div>
    </Disclosure>
  );
};

export default Products;
