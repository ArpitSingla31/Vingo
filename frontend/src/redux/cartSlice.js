import { createSlice } from "@reduxjs/toolkit";

const getStoredCart = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem("vingo-cart"));
  } catch {
    return null;
  }
};

const persistCart = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    "vingo-cart",
    JSON.stringify({
      cartItems: state.cartItems,
      cartShop: state.cartShop,
    })
  );
};

const storedCart = getStoredCart();

const initialState = {
  cartItems: storedCart?.cartItems || [],
  cartShop: storedCart?.cartShop || null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const incomingItem = action.payload;

      if (
        state.cartShop &&
        state.cartShop.shopId &&
        state.cartShop.shopId !== incomingItem.shopId
      ) {
        state.cartItems = [];
      }

      state.cartShop = {
        shopId: incomingItem.shopId,
        shopName: incomingItem.shopName,
      };

      const existingItem = state.cartItems.find(
        (item) => item._id === incomingItem._id
      );

      if (existingItem) {
        existingItem.quantity += incomingItem.quantity || 1;
      } else {
        state.cartItems.push({
          ...incomingItem,
          quantity: incomingItem.quantity || 1,
        });
      }

      persistCart(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );

      if (!state.cartItems.length) {
        state.cartShop = null;
      }

      persistCart(state);
    },
    incrementCartItem: (state, action) => {
      const item = state.cartItems.find((cartItem) => cartItem._id === action.payload);

      if (item) {
        item.quantity += 1;
      }

      persistCart(state);
    },
    decrementCartItem: (state, action) => {
      const item = state.cartItems.find((cartItem) => cartItem._id === action.payload);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.cartItems = state.cartItems.filter(
          (cartItem) => cartItem._id !== action.payload
        );
      }

      if (!state.cartItems.length) {
        state.cartShop = null;
      }

      persistCart(state);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.cartShop = null;
      persistCart(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementCartItem,
  decrementCartItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
