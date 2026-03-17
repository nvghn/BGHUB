import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getCart, updateCartQty, removeCartItem, toggleCartItem } from "../services/cartService";

const Cart = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);

  const loadCart = async () => {
    const data = await getCart(token);
    setCart(data);
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (id, qty) => { await updateCartQty(id, qty, token); loadCart(); };
  const removeItem = async (id) => { await removeCartItem(id, token); loadCart(); };
  const toggleItem = async (id) => { await toggleCartItem(id, token); loadCart(); };

  if (!cart) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Your Cart</h1>
      {cart.items.map(item => (
        <div key={item._id}>
          <img src={item.imageUrl} width="80" />
          <h3>{item.name}</h3>
          <p>₹ {item.price}</p>
          <p>Qty: {item.quantity}</p>
          <button onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
          <button onClick={() => updateQty(item._id, item.quantity - 1)}>-</button>
          <button onClick={() => toggleItem(item._id)}>{item.selected ? "Unselect" : "Select"}</button>
          <button onClick={() => removeItem(item._id)}>Remove</button>
        </div>
      ))}
      <h2>Total: ₹ {cart.total}</h2>
      <h2>Selected Total: ₹ {cart.selectedTotal}</h2>
      <button onClick={() => navigate("/checkout")}>Checkout</button>
    </div>
  );
};

export default Cart;
