import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  assignDeliveryBoy,
  getDeliveryOrders,
  getMyOrders,
  getOwnerOrders,
  placeOrder,
  updateDeliveryLocation,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/place", isAuth, placeOrder);
orderRouter.get("/my", isAuth, getMyOrders);
orderRouter.get("/owner", isAuth, getOwnerOrders);
orderRouter.get("/delivery", isAuth, getDeliveryOrders);
orderRouter.patch("/assign/:orderId", isAuth, assignDeliveryBoy);
orderRouter.patch("/status/:orderId", isAuth, updateOrderStatus);
orderRouter.patch("/location/:orderId", isAuth, updateDeliveryLocation);

export default orderRouter;
