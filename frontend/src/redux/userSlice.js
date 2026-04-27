import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    authChecked: false,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    foodSearchTerm: "",
    currentCoords: {
      lat: null,
      lng: null,
    },
  },

  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },

    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },

    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },

    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },

    setFoodSearchTerm: (state, action) => {
      state.foodSearchTerm = action.payload;
    },

    setCurrentCoords: (state, action) => {
      state.currentCoords = action.payload;
    },

    logoutUser: (state) => {
      state.userData = null;
      state.authChecked = true;
      state.currentCity = null;
      state.currentState = null;
      state.currentAddress = null;
      state.foodSearchTerm = "";
      state.currentCoords = {
        lat: null,
        lng: null,
      };
    },
  },
});

export const {
  setUserData,
  setAuthChecked,
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
  setFoodSearchTerm,
  setCurrentCoords,
  logoutUser,
} = userSlice.actions;

export default userSlice.reducer;
