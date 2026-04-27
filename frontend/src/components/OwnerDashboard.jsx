import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaPen } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { normalizeMediaUrl } from "../utils/media";

const OwnerDashboard = () => {
  const myShopData = useSelector((state) => state.owner?.myShopData);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const result = await axios.get(`${serverUrl}/api/order/owner`, {
        withCredentials: true,
      });
      setOrders(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (myShopData?._id) {
      fetchOrders();
    }
  }, [myShopData?._id]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await axios.patch(
        `${serverUrl}/api/order/status/${orderId}`,
        { status },
        { withCredentials: true }
      );
      await fetchOrders();
    } catch (error) {
      console.log(error);
    } finally {
      setUpdatingOrderId("");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[linear-gradient(180deg,_#020617,_#111827_45%,_#172033)]">
      
      <Nav />

      {/* ===== NO SHOP ===== */}
      {!myShopData || !myShopData?._id ? (
        <div className="flex justify-center items-center p-4 sm:p-6 w-full mt-10">
          
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border text-center">
            
            <FaUtensils className="text-[#ff4d2d] text-4xl mb-4 mx-auto" />

            <h2 className="text-xl font-bold mb-2">
              Add Your Restaurant
            </h2>

            <p className="text-gray-600 mb-4">
              Join our food delivery platform and reach thousands of hungry customers.
            </p>

            <button
              onClick={() => navigate("/create-edit-shop")}
              className="bg-[#ff4d2d] text-white px-5 py-2 rounded-full block mx-auto cursor-pointer hover:bg-orange-600 transition"
            >
              Get Started
            </button>
          </div>
        </div>

      ) : (

        /* ===== SHOP EXISTS ===== */
        <div className="w-full flex flex-col items-center px-4 sm:px-6 mt-6 pb-10">

          <div className="hero-panel-dark w-full max-w-6xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
                  Owner control room
                </p>
                <h1 className="mt-3 text-3xl sm:text-4xl flex items-center gap-3">
                  <FaUtensils className="text-[#ff4d2d]" />
                  {myShopData.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-300">
                  This dashboard is only for restaurant owners. Manage shop info,
                  add menu items, and handle incoming orders from here.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/add-food")}
                  className="rounded-full bg-[#ff4d2d] px-5 py-3 text-sm font-semibold text-white"
                >
                  Add Food Item
                </button>
                <button
                  onClick={() => navigate("/create-edit-shop")}
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
                >
                  Edit Shop
                </button>
              </div>
            </div>
          </div>

          <div className="surface-card-strong relative mt-6 w-full max-w-6xl overflow-hidden">

            {/* Edit Button */}
            <div
              onClick={() => navigate("/create-edit-shop")}
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full cursor-pointer hover:bg-orange-600"
            >
              <FaPen size={18} />
            </div>

            {/* Image */}
            <img
              src={normalizeMediaUrl(myShopData?.image)}
              alt="shop"
              className="w-full h-56 sm:h-72 object-cover"
            />

            {/* Details */}
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {myShopData?.name}
              </h2>

              <p className="text-gray-500">
                {myShopData?.city}, {myShopData?.state}
              </p>

              <p className="text-gray-500 mt-1">
                {myShopData?.address}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  myShopData?.address || ""
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-[#ff4d2d]"
              >
                Open restaurant location on map
              </a>
            </div>
          </div>
          <div className="mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <div className="surface-card p-6">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Add Your Food Item
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Share your delicious creations with our customers by adding them to the menu.
                  </p>
                  <button
                    onClick={() => navigate("/add-food")}
                    className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition"
                  >
                    Add Food Item
                  </button>
                </div>
              </div>

              <div className="surface-card-strong p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#ff4d2d]">
                      Menu
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                      Your listed items
                    </h2>
                  </div>
                  <button
                    className="rounded-full border border-orange-200 px-4 py-2 text-sm font-medium text-[#ff4d2d]"
                    onClick={() => navigate("/add-food")}
                  >
                    Add new item
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {myShopData?.items?.length ? (
                    myShopData.items.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <img
                          src={normalizeMediaUrl(item.image)}
                          alt={item.name}
                          className="h-36 w-full rounded-2xl object-cover"
                        />
                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.category} • {item.foodType}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            Rs. {item.price}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 sm:col-span-2">
                      No food items added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-950 p-6 text-white shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
                    Orders
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Incoming orders
                  </h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  {orders.length}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {loadingOrders ? (
                  <div className="rounded-2xl bg-white/5 p-5 text-sm text-slate-300">
                    Loading orders...
                  </div>
                ) : orders.length ? (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-2xl bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">
                            {order.user?.fullName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-300">
                            Rs. {order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <span className="rounded-full bg-orange-400/20 px-3 py-1 text-xs font-semibold text-orange-200">
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-300">
                        {order.deliveryAddress}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[
                          { label: "Confirm", value: "confirmed" },
                          { label: "Preparing", value: "preparing" },
                          { label: "Ready", value: "ready_for_pickup" },
                        ].map((action) => (
                          <button
                            key={action.value}
                            className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold"
                            onClick={() =>
                              updateOrderStatus(order._id, action.value)
                            }
                            disabled={updatingOrderId === order._id}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/5 p-5 text-sm text-slate-300">
                    No orders yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
