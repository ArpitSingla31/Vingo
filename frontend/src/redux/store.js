import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import cartReducer from "./cartSlice"; // ✅ ADD THIS
import ownerReducer from "./ownerSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    owner:ownerReducer // ✅ VERY IMPORTANT
  },
  devTools: true,
});