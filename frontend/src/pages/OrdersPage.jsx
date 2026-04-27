import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Nav from "../components/Nav";
import LiveDeliveryMap from "../components/LiveDeliveryMap";
import { serverUrl } from "../App";
import { normalizeMediaUrl } from "../utils/media";

const roleToEndpoint = {
  user: "/api/order/my",
  owner: "/api/order/owner",
  deliveryboy: "/api/order/delivery",
};

const OrdersPage = () => {
  const { userData } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userData?.role) {
        return;
      }

      try {
        setLoading(true);
        const result = await axios.get(
          `${serverUrl}${roleToEndpoint[userData.role] || "/api/order/my"}`,
          { withCredentials: true }
        );
        setOrders(result.data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userData?.role]);

  const trackedOrder = orders.find((order) =>
    ["picked_up", "on_the_way"].includes(order.status)
  );

  return (
    <div className="app-shell min-h-screen pb-12">
      <Nav />

      <div className="page-shell pt-28">
        <div className="hero-panel">
          <p className="section-kicker">
            Orders
          </p>
          <h1 className="section-title">
            {userData?.role === "owner"
              ? "Manage incoming orders"
              : userData?.role === "deliveryboy"
                ? "Assigned deliveries"
                : "Track your orders"}
          </h1>
        </div>

        {trackedOrder && userData?.role === "user" && (
          <div className="mt-6">
            <LiveDeliveryMap order={trackedOrder} />
          </div>
        )}

        <div className="mt-6 grid gap-4">
          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading orders...
            </div>
          ) : orders.length ? (
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
                      Deliver to: {order.deliveryAddress}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Total: Rs. {order.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {userData?.role === "owner" && (
                      <p>Customer: {order.user?.fullName}</p>
                    )}
                    {userData?.role === "deliveryboy" && (
                      <p>Restaurant: {order.shop?.address}</p>
                    )}
                    {userData?.role === "user" && (
                      <p>
                        Delivery boy:{" "}
                        {order.deliveryBoy?.fullName || "Not assigned yet"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {order.items.map((item) => (
                    <div
                      key={`${order._id}-${item.item}`}
                      className="rounded-[22px] border border-slate-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={normalizeMediaUrl(item.image)}
                          alt={item.name}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {item.quantity} x Rs. {item.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              No orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
