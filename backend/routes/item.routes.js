import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, editItem, getItemsByShop } from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// ✅ Add item
router.post(
  "/add-item",
  isAuth,
  upload.single("image"),
  addItem
);

// ✅ Edit item
router.put(
  "/edit-item/:itemId",
  isAuth,
  upload.single("image"),
  editItem
);

router.get("/shop/:shopId", getItemsByShop);

export default router;
