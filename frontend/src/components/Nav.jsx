import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logoutUser, setFoodSearchTerm, setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";
import { TbReceipt2 } from "react-icons/tb";
import { clearCart } from "../redux/cartSlice";
import { clearAuthSession } from "../utils/authSession";

const Nav = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, currentCity, foodSearchTerm } = useSelector(
    (state) => state.user || {}
  );
  const { cartItems } = useSelector((state) => state.cart || {});
  const cartCount = cartItems?.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      clearAuthSession();
      dispatch(setUserData(null));
      dispatch(logoutUser());
      dispatch(clearCart());
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="top-nav">
        <h1
          className="cursor-pointer text-2xl font-bold tracking-tight text-[#f05a28]"
          onClick={() => navigate("/")}
        >
          Vingo
        </h1>
        {userData?.role === "user" && (
          <div className="hidden md:flex items-center gap-3 mx-6 flex-1 justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2">
              <FaLocationDot className="text-[#ff4d2d]" />
              <p className="max-w-[140px] truncate text-sm text-slate-600">
                {currentCity || "Select City"}
              </p>
            </div>

            <div className="flex w-[300px] items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <IoIosSearch className="text-[#ff4d2d]" />
              <input
                type="text"
                placeholder="Search food..."
                className="w-full bg-transparent text-sm outline-none"
                value={foodSearchTerm}
                onChange={(event) =>
                  dispatch(setFoodSearchTerm(event.target.value))
                }
              />
            </div>
          </div>
        )}
        <div className="flex items-center gap-4">
          {userData?.role === "user" &&
            (showSearch ? (
              <RxCross2
                size={25}
                className="text-[#ff4d2d] md:hidden cursor-pointer"
                onClick={() => setShowSearch(false)}
              />
            ) : (
              <IoIosSearch
                size={25}
                className="text-[#ff4d2d] md:hidden cursor-pointer"
                onClick={() => setShowSearch(true)}
              />
            ))}

          {userData?.role === "owner" && (
            <>
              <button
                className="brand-button hidden md:flex gap-2 px-4 py-2.5"
                onClick={() => navigate("/add-food")}
              >
                <FaPlus size={20} />
                <span>Add Food Item</span>
              </button>

              <button
                className="brand-button md:hidden p-2.5"
                onClick={() => navigate("/add-food")}
              >
                <FaPlus size={20} />
              </button>
            </>
          )}

          {userData?.role === "user" && (
            <div
              className="relative cursor-pointer rounded-full bg-white p-3 shadow-sm"
              onClick={() => navigate("/cart")}
            >
              <FiShoppingCart size={25} className="text-[#ff4d2d]" />

              {cartCount > 0 && (
                <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d] text-sm">
                  {cartCount}
                </span>
              )}
            </div>
          )}

          {userData?.role === "owner" && (
            <>
              <div
                className="ghost-button hidden cursor-pointer md:flex"
                onClick={() => navigate("/orders")}
              >
                <TbReceipt2 size={20} />
                <span>My Orders</span>
              </div>

              <div
                className="ghost-button cursor-pointer md:hidden"
                onClick={() => navigate("/orders")}
              >
                <TbReceipt2 size={20} />
              </div>
            </>
          )}
          {userData && userData.role !== "owner" && (
            <div
              className="ghost-button hidden cursor-pointer md:flex"
              onClick={() => navigate("/orders")}
            >
              <span>My Orders</span>
            </div>
          )}

          {userData && (
            <div className="relative">
              <div
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f05a28] text-white shadow-sm"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                {userData.fullName?.slice(0, 1) || "A"}
              </div>

              {showMenu && (
                <div className="surface-card absolute right-0 z-50 mt-3 w-[220px] p-3">
                  <p className="text-xs text-slate-500">Welcome</p>
                  <p className="mb-2 border-b border-slate-200 pb-2 text-sm font-semibold">
                    {userData.fullName || "User"}
                  </p>

                  <p
                    className="cursor-pointer rounded-xl p-2 text-sm hover:bg-orange-50"
                    onClick={() => navigate("/orders")}
                  >
                    My Orders
                  </p>

                  <p
                    className="cursor-pointer rounded-xl p-2 text-sm text-red-500 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSearch && userData?.role === "user" && (
        <div className="surface-card fixed left-[5%] top-[88px] z-50 flex h-[78px] w-[90%] items-center px-3">
          <div className="flex w-[30%] items-center gap-2 pr-2">
            <FaLocationDot className="text-[#ff4d2d]" />
            <p className="truncate text-sm text-slate-600">{currentCity}</p>
          </div>

          <div className="flex items-center w-[60%] gap-2 pl-2">
            <IoIosSearch className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="search delicious food..."
              className="w-full bg-transparent text-sm outline-none"
              autoFocus
              value={foodSearchTerm}
              onChange={(event) =>
                dispatch(setFoodSearchTerm(event.target.value))
              }
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;
