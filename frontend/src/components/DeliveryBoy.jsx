import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./Nav";
import LiveDeliveryMap from "./LiveDeliveryMap";
import { serverUrl } from "../App";

const statusActions = [
  { label: "Picked Up", value: "picked_up" },
  { label: "On The Way", value: "on_the_way" },
  { label: "Delivered", value: "delivered" },
];

const DeliveryBoy = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setErrorMessage("");
      const result = await axios.get(`${serverUrl}/api/order/delivery`, {
        withCredentials: true,
      });
      setOrders(result.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to refresh delivery orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const intervalId = window.setInterval(() => {
      fetchOrders();
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, []);

  const claimOrder = async (orderId) => {
    try {
      setUpdatingId(orderId);
      setErrorMessage("");
      setSuccessMessage("");
      await axios.patch(
        `${serverUrl}/api/order/assign/${orderId}`,
        {},
        { withCredentials: true }
      );
      setSuccessMessage("Order assigned successfully.");
      await fetchOrders();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to assign this order."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      setErrorMessage("");
      setSuccessMessage("");
      await axios.patch(
        `${serverUrl}/api/order/status/${orderId}`,
        { status },
        { withCredentials: true }
      );
      setSuccessMessage(`Order updated to ${status.replaceAll("_", " ")}.`);
      await fetchOrders();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update order status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const shareLocation = async (orderId) => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        setUpdatingId(orderId);
        setErrorMessage("");
        setSuccessMessage("");
        await axios.patch(
          `${serverUrl}/api/order/location/${orderId}`,
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Live location shared from delivery dashboard",
          },
          { withCredentials: true }
        );
        setSuccessMessage("Live location shared successfully.");
        await fetchOrders();
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Failed to share live location."
        );
      } finally {
        setUpdatingId("");
      }
    });
  };

  const activeOrder = orders.find((order) => order.deliveryBoy?._id);

  return (
    <div className="w-full">
      <Nav />

      <div className="page-shell pt-6">
        <section className="hero-panel-dark">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">
            Delivery Hub
          </p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Manage pickups and share live route updates.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-200 sm:text-base">
            Claim ready orders, push live location from your device, and update
            delivery status in one place.
          </p>
        </section>

        {activeOrder && (
          <div className="mt-6">
            <LiveDeliveryMap order={activeOrder} />
          </div>
        )}

        {(errorMessage || successMessage) && (
          <div className="mt-6 space-y-3">
            {errorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4">
          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading delivery queue...
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">
                        {order.shop?.name}
                      </h2>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Pickup: {order.shop?.address}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Drop: {order.deliveryAddress}
                    </p>
                  </div>

                  {!order.deliveryBoy ? (
                    <button
                      className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                      onClick={() => claimOrder(order._id)}
                      disabled={updatingId === order._id}
                    >
                      {updatingId === order._id ? "Claiming..." : "Claim order"}
                    </button>
                  ) : (
                    <button
                      className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                      onClick={() => shareLocation(order._id)}
                      disabled={updatingId === order._id}
                    >
                      Share live location
                    </button>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {order.deliveryBoy &&
                    statusActions.map((action) => (
                      <button
                        key={action.value}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                        onClick={() => updateOrderStatus(order._id, action.value)}
                        disabled={updatingId === order._id}
                      >
                        {action.label}
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}

          {!loading && !orders.length && (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              No deliveries are available right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoy;
