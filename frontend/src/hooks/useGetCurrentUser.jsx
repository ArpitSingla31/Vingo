import axios from "axios";
import React, { useEffect } from "react";
import { serverUrl } from "../App";
import { setAuthChecked, setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { clearAuthSession, hasStoredAuthSession, saveAuthSession } from "../utils/authSession";

function useGetCurrentUser() {
    const dispatch = useDispatch()
  useEffect(() => {
    if (!hasStoredAuthSession()) {
      dispatch(setUserData(null));
      dispatch(setAuthChecked(true));
      return;
    }

    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/current`,
          { withCredentials: true } )
          saveAuthSession();
          dispatch(setUserData(result.data))
      } catch {
        clearAuthSession();
        dispatch(setUserData(null));
      } finally {
        dispatch(setAuthChecked(true));
      }
    };

    fetchUser();
  }, [dispatch]);
}

export default useGetCurrentUser;
