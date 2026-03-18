import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartQty,
  removeCartItem,
  toggleCartItem
} from "../services/cartService";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);

  // LOAD CART
  const loadCart = async () => {
    try {
      const data = await getCart();
      setCart(data.cart); // ✅ FIXED
    } catch (err) {
      console.log("Cart Load Error:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // UPDATE QTY
  const updateQty = async (id, qty) => {
    if (qty < 1) return;
    await updateCartQty(id, qty);
    loadCart();
  };

  // REMOVE ITEM
  const removeItem = async (id) => {
    await removeCartItem(id);
    loadCart();
  };

  // TOGGLE ITEM
  const toggleItem = async (id) => {
    await toggleCartItem(id);
    loadCart();
  };

  // LOADING
  if (!cart || !cart.items) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Cart</h1>

      {cart.items.length === 0 ? (
        <h3>Cart is empty</h3>
      ) : (
        cart.items.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "10px",
              padding: "10px"
            }}
          >
            <img src={item.imageUrl} width="80" alt={item.name} />
            <h3>{item.name}</h3>
            <p>₹ {item.price}</p>
            <p>Qty: {item.quantity}</p>

            <button onClick={() => updateQty(item._id, item.quantity + 1)}>
              +
            </button>

            <button onClick={() => updateQty(item._id, item.quantity - 1)}>
              -
            </button>

            <button onClick={() => toggleItem(item._id)}>
              {item.selected ? "Unselect" : "Select"}
            </button>

            <button onClick={() => removeItem(item._id)}>
              Remove
            </button>
          </div>
        ))
      )}

      <h2>Total: ₹ {cart.total}</h2>
      <h2>Selected Total: ₹ {cart.selectedTotal}</h2>

      <button onClick={() => navigate("/checkout")}>
        Checkout
      </button>
    </div>
  );
};

export default Cart;
