import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import useGetCity from "../hooks/useGetCity";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import axios from "axios";
import useGetMyShop from "../hooks/useGetMyShop";

const CreateEditShop = () => {
  useGetCity();
  useGetMyShop();
  const navigate = useNavigate();

  // Redux data
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress, currentCoords } = useSelector(
    (state) => state.user,
  );

  // Local state
  const [formValues, setFormValues] = useState({
    name: "",
    address: "",
    city: "",
    shopState: "",
  });
  const name = formValues.name || myShopData?.name || "";
  const address = formValues.address || myShopData?.address || currentAddress || "";
  const city = formValues.city || myShopData?.city || currentCity || "";
  const shopState = formValues.shopState || myShopData?.state || currentState || "";
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const dispatch = useDispatch();
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      const preview = URL.createObjectURL(file); // ✅ create preview URL
      setFrontendImage(preview); // for UI
      setBackendImage(file); // (optional) for backend upload
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("city", city);
    formData.append("state", shopState);
    formData.append("address", address);
    if (currentCoords?.lat && currentCoords?.lng) {
      formData.append("lat", currentCoords.lat);
      formData.append("lng", currentCoords.lng);
    }

    if (backendImage) {
      formData.append("image", backendImage);
    }

    const result = await axios.post(
      `${serverUrl}/api/shop/create-edit`,
      formData,
      { withCredentials: true }
    );

    const shopData = result.data.shop || result.data;

    console.log("UPDATED SHOP:", shopData);

    // ✅ UPDATE REDUX
    dispatch(setMyShopData(shopData));

    // ✅ GO HOME
    navigate("/");

  } catch (error) {
    console.log(error);
  }
};
  // Sync Redux → Local
  const imagePreview = frontendImage || myShopData?.image || null;

  return (
    <div className="auth-shell !min-h-screen">
      <div
        className="absolute left-6 top-6 z-[10] mb-[10px] cursor-pointer text-[#f05a28]"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} />
      </div>

      <div className="auth-card max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 rounded-full bg-orange-100 p-4">
            <FaUtensils className="text-[#ff4d2d]" size={24} />
          </div>

          <p className="section-kicker">
            Owner Workspace
          </p>
          <div className="mt-2 text-center text-3xl font-extrabold text-gray-900">
           {myShopData && myShopData._id ?  "Edit Shop" : "Add Shop"}
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="field-label">Name</label>
            <input
              type="text"
              placeholder="Enter Shop Name"
              className="field-input"
              value={name}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="field-label">Shop Image</label>
            <input
              type="file"
              accept="image/*"
              className="field-input"
              onChange={handleImage}
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt=""
                  className="h-56 w-full rounded-[24px] object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="field-label">City</label>
              <input
                type="text"
                placeholder="City"
                className="field-input"
                value={city}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="field-label">State</label>
              <input
                type="text"
                placeholder="State"
                className="field-input"
                value={shopState}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    shopState: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="field-label">Address</label>
            <input
              type="text"
              placeholder="Enter Shop Address"
              className="field-input"
              value={address || ""}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            className="brand-button w-full"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
