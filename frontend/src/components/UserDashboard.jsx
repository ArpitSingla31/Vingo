import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/cartSlice";
import { serverUrl } from "../App";
import { normalizeMediaUrl } from "../utils/media";

const inspirationCategories = [
  "All",
  "Biryani",
  "Pizza",
  "Burgers",
  "Chinese",
  "South Indian",
  "Desserts",
  "Fast Food",
];

const getShopKey = (shop, index) =>
  shop?._id || `${shop?.name || "shop"}-${shop?.city || "unknown"}-${index}`;

const getMenuItemKey = (item, index) =>
  item?._id ||
  `${item?.name || "item"}-${item?.category || "misc"}-${item?.price || 0}-${index}`;

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCity, foodSearchTerm } = useSelector((state) => state.user);
  const { cartShop } = useSelector((state) => state.cart);
  const [shops, setShops] = useState([]);
  const [activeShopId, setActiveShopId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const result = await axios.get(`${serverUrl}/api/shop/all`);
        setShops(result.data);
        if (result.data.length) {
          setActiveShopId(result.data[0]._id);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const filteredShops = useMemo(() => {
    const searchValue = foodSearchTerm.toLowerCase().trim();

    return shops.filter((shop) => {
      return (
        !searchValue ||
        shop.name.toLowerCase().includes(searchValue) ||
        shop.items?.some(
          (item) =>
            item.name.toLowerCase().includes(searchValue) ||
            item.category.toLowerCase().includes(searchValue)
        )
      );
    });
  }, [foodSearchTerm, shops]);

  const activeShop =
    filteredShops.find((shop) => shop._id === activeShopId) || filteredShops[0];

  useEffect(() => {
    if (activeShop && activeShop._id !== activeShopId) {
      setActiveShopId(activeShop._id);
    }
  }, [activeShop, activeShopId]);

  const filteredItems = useMemo(() => {
    if (!activeShop?.items) {
      return [];
    }

    const searchValue = foodSearchTerm.toLowerCase().trim();

    return activeShop.items.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory ||
        item.name.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesSearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }, [activeShop, foodSearchTerm, selectedCategory]);

  const menuSections = useMemo(() => {
    return filteredItems.reduce((accumulator, item) => {
      if (!accumulator[item.category]) {
        accumulator[item.category] = [];
      }

      accumulator[item.category].push(item);
      return accumulator;
    }, {});
  }, [filteredItems]);

  const handleAddToCart = (item, shop) => {
    if (cartShop?.shopId && cartShop.shopId !== shop._id) {
      const shouldReplace = window.confirm(
        "Your cart has items from another restaurant. Replace them with this order?"
      );

      if (!shouldReplace) {
        return;
      }
    }

    dispatch(
      addToCart({
        ...item,
        shopId: shop._id,
        shopName: shop.name,
      })
    );
  };

  if (loading) {
    return (
      <div className="w-full px-4">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading restaurants...
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <p className="section-kicker">
          Vingo Food
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="section-title leading-tight">
              Order from top restaurants in {currentCity || "your city"}.
            </h1>
            <p className="section-copy max-w-xl">
              Search from the top bar, browse categories, and add food items
              directly from the menu layout.
            </p>
          </div>

          <div className="surface-card w-full max-w-md p-4">
            <p className="text-sm font-medium text-slate-500">Top search bar is active</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {foodSearchTerm ? `Results for "${foodSearchTerm}"` : "Browse menu by category"}
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card-strong mt-8 p-6">
        <p className="text-lg font-semibold text-slate-900">
          Inspiration for your first order
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {inspirationCategories.map((category) => (
            <button
              key={category}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "chip-button chip-button-active"
                  : "chip-button"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Top brands for you
              </h2>
              <button
                className="brand-button px-4 py-2 text-xs uppercase tracking-[0.2em]"
                onClick={() => navigate("/cart")}
              >
                Open cart
              </button>
            </div>
          </div>

          {filteredShops.map((shop, index) => (
            <button
              key={getShopKey(shop, index)}
              className={`w-full overflow-hidden rounded-[28px] border text-left transition ${
                activeShop?._id === shop._id
                  ? "border-orange-300 bg-orange-50 shadow-md"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
              onClick={() => setActiveShopId(shop._id)}
            >
              <img
                src={normalizeMediaUrl(shop.image)}
                alt={shop.name}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {shop.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {shop.city}, {shop.state}
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {shop.items?.length || 0} items
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{shop.address}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="surface-card-strong p-6">
          {activeShop ? (
            <>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
                    Restaurant Menu
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                    {activeShop.name}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-slate-500">
                    {activeShop.address}
                  </p>
                </div>

                <div className="rounded-[24px] border border-orange-100 bg-orange-50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
                    Restaurant location
                  </p>
                  <p className="mt-2 max-w-[280px] text-sm text-slate-700">
                    {activeShop.address}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      activeShop.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-orange-600"
                  >
                    Open on map
                  </a>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Menu categories</p>
                  <div className="mt-4 space-y-2">
                    {Object.keys(menuSections).length ? (
                      Object.keys(menuSections).map((category) => (
                        <button
                          key={category}
                          className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <span>{category}</span>
                          <span className="text-xs text-slate-400">
                            {menuSections[category].length}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No categories found.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.keys(menuSections).length ? (
                    Object.entries(menuSections).map(([category, items]) => (
                      <div key={category}>
                        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                          <h3 className="text-xl font-semibold text-slate-900">
                            {category}
                          </h3>
                          <span className="text-sm text-slate-500">
                            {items.length} items
                          </span>
                        </div>

                        <div className="space-y-4">
                          {items.map((item, index) => (
                            <div
                              key={getMenuItemKey(item, index)}
                              className="grid gap-4 rounded-[26px] border border-slate-200 p-4 sm:grid-cols-[120px_minmax(0,1fr)_120px]"
                            >
                              <img
                                src={normalizeMediaUrl(item.image)}
                                alt={item.name}
                                className="h-28 w-full rounded-[22px] object-cover"
                              />
                              <div>
                                <h4 className="text-lg font-semibold text-slate-900">
                                  {item.name}
                                </h4>
                                <p className="mt-2 text-sm text-slate-500">
                                  {item.category} • {item.foodType}
                                </p>
                                <p className="mt-3 text-base font-semibold text-orange-600">
                                  Rs. {item.price}
                                </p>
                              </div>
                              <div className="flex flex-col justify-between">
                                <button
                                  className="rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
                                  onClick={() => handleAddToCart(item, activeShop)}
                                >
                                  Add
                                </button>
                                <button
                                  className="mt-3 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                                  onClick={() => navigate("/cart")}
                                >
                                  View cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                      No food items match this search yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              No restaurants available yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
