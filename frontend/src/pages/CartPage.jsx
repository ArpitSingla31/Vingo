import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { serverUrl } from "../App";
import {
  clearCart,
  decrementCartItem,
  incrementCartItem,
  removeFromCart,
} from "../redux/cartSlice";
import { normalizeMediaUrl } from "../utils/media";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, cartShop } = useSelector((state) => state.cart);
  const { currentAddress, currentCoords } = useSelector((state) => state.user);
  const [deliveryAddress, setDeliveryAddress] = useState(currentAddress || "");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const pricing = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = subtotal > 399 ? 0 : cartItems.length ? 39 : 0;
    const taxes = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + deliveryFee + taxes).toFixed(2));

    return { subtotal, deliveryFee, taxes, total };
  }, [cartItems]);

  const handleCheckout = async () => {
    if (!cartItems.length) {
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      await axios.post(
        `${serverUrl}/api/order/place`,
        {
          shopId: cartShop?.shopId,
          deliveryAddress,
          paymentMethod: "cod",
          customerLocation: currentCoords,
          items: cartItems.map((item) => ({
            itemId: item._id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        },
        { withCredentials: true }
      );

      dispatch(clearCart());
      navigate("/orders");
    } catch (checkoutError) {
      setError(
        checkoutError.response?.data?.message || "Failed to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="app-shell min-h-screen pb-12">
      <Nav />

      <div className="page-shell flex flex-col gap-6 pt-28 lg:flex-row">
        <div className="surface-card-strong flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
                Cart
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {cartShop?.shopName || "Your order"}
              </h1>
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              onClick={() => navigate("/")}
            >
              Add more food
            </button>
          </div>

          {!cartItems.length ? (
            <div className="mt-10 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Pick a restaurant and add your first item.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-[24px] border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <img
                    src={normalizeMediaUrl(item.image)}
                    alt={item.name}
                    className="h-28 w-full rounded-[20px] object-cover sm:w-36"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.category} • {item.foodType}
                        </p>
                      </div>
                      <button
                        className="text-sm font-medium text-rose-500"
                        onClick={() => dispatch(removeFromCart(item._id))}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-slate-200">
                        <button
                          className="px-4 py-2 text-lg"
                          onClick={() => dispatch(decrementCartItem(item._id))}
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          className="px-4 py-2 text-lg"
                          onClick={() => dispatch(incrementCartItem(item._id))}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-base font-semibold text-slate-900">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hero-panel-dark w-full lg:max-w-[380px]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
            Checkout
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Ready to place order</h2>

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-200">
              Delivery address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              rows="4"
              className="mt-2 w-full rounded-[20px] border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              placeholder="Flat / house number, area, landmark"
            />
          </div>

          <div className="mt-6 space-y-3 rounded-[24px] bg-white/8 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Subtotal</span>
              <span>Rs. {pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Delivery fee</span>
              <span>Rs. {pricing.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Taxes</span>
              <span>Rs. {pricing.taxes.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold">
              <span>Total</span>
              <span>Rs. {pricing.total.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

          <button
            className="mt-6 w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleCheckout}
            disabled={!cartItems.length || placingOrder}
          >
            {placingOrder ? "Placing order..." : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
