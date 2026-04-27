import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { setAuthChecked, setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";

function useGetCurrentUser() {
    const dispatch = useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/current`,
          { withCredentials: true } )
          dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error.response?.data);
        dispatch(setUserData(null));
      } finally {
        dispatch(setAuthChecked(true));
      }
    };

    fetchUser();
  }, [dispatch]);
}

export default useGetCurrentUser;
