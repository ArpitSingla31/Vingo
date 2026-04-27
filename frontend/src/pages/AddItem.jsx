import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { IoIosArrowRoundBack } from "react-icons/io";
import { setMyShopData } from "../redux/ownerSlice";

const AddItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);

  // ===== STATES =====
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [isPopular, setIsPopular] = useState(true);
  const [discount, setDiscount] = useState("20");
  const [ratingsCount, setRatingsCount] = useState("120");

  const [backendImage, setBackendImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ===== HANDLE IMAGE =====
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ===== SUBMIT =====
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!myShopData?._id) {
    alert("Shop not loaded yet");
    return;
  }

  if (!backendImage) {
    alert("Please select image");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("category", category);
    formData.append("foodType", foodType);
    formData.append("price", price);
    formData.append("shopId", myShopData._id);
    formData.append("isPopular", isPopular);
    formData.append("discount", discount);
    formData.append("ratingsCount", ratingsCount);
    formData.append("image", backendImage);

    const res = await axios.post(
      `${serverUrl}/api/item/add-item`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(res.data);
    dispatch(
      setMyShopData({
        ...myShopData,
        items: [...(myShopData?.items || []), res.data.item],
      })
    );
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};
  return (
    <div className="auth-shell !min-h-screen">
      <div
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 cursor-pointer text-[#f05a28]"
      >
        <IoIosArrowRoundBack size={35} />
      </div>

      <div className="auth-card max-w-lg">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <span className="text-2xl">🍴</span>
          </div>
        </div>

        <p className="section-kicker text-center">Menu Management</p>
        <h2 className="text-center text-3xl font-bold mb-6">
          Add Food
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Name</label>
            <input
              type="text"
              placeholder="Enter Food Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Food Image</label>
            <input
              type="file"
              onChange={handleImage}
              className="field-input"
              required
            />
          </div>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-full h-52 object-cover rounded-[24px]"
            />
          )}

          <div>
            <label className="field-label">Price</label>
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field-input"
              required
            />
          </div>

          <div>
            <label className="field-label">Select Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field-input"
            >
              <option value="">Select</option>
              <option value="Snacks">Snacks</option>
              <option value="Pizza">Pizza</option>
              <option value="Desserts">Desserts</option>
              <option value="Burgers">Burgers</option>
              <option value="Sandwiches">Sandwiches</option>
              <option value="South Indian">South Indian</option>
              <option value="North Indian">North Indian</option>
              <option value="Chinese">Chinese</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="field-label">Select Food Type</label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="field-input"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label">Ratings Count</label>
              <input
                type="number"
                min="0"
                value={ratingsCount}
                onChange={(e) => setRatingsCount(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <span>Mark as popular item</span>
            <input
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="h-4 w-4 accent-[#f05a28]"
            />
          </label>

          <button
            type="submit"
            className="brand-button mt-2 w-full"
          >
            Save
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddItem;
