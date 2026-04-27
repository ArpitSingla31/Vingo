import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { serverUrl } from "../App";

function useGetMyShop() {
  const dispatch = useDispatch();
  const { userData, authChecked } = useSelector((state) => state.user);

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (userData?.role !== "owner") {
      dispatch(setMyShopData(null));
      return;
    }

    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
          withCredentials: true,
        });

        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.log(error.response?.data);
        dispatch(setMyShopData(null));
      }
    };

    fetchShop();
  }, [authChecked, dispatch, userData?.role]);
}

export default useGetMyShop;
