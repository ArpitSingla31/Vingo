import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentCoords,
  setCurrentState,
} from "../redux/userSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    if (!userData || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        dispatch(
          setCurrentCoords({
            lat: latitude,
            lng: longitude,
          })
        );

        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`
        );

        const data = res.data.features[0].properties;

        dispatch(setCurrentCity(data.city));
        dispatch(setCurrentState(data.state));
        dispatch(setCurrentAddress(data.formatted));
      } catch (error) {
        console.log(error);
      }
    });
  }, [apiKey, dispatch, userData]);
}

export default useGetCity;
