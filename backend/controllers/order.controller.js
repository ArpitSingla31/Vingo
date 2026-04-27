import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";

const populateOrderQuery = (query) =>
  query.populate("user", "fullName email mobile")
    .populate("owner", "fullName email mobile")
    .populate("deliveryBoy", "fullName email mobile role")
    .populate("shop", "name image city state address location");

const normalizeRole = (role = "") => role.toLowerCase().replace(/[^a-z]/g, "");

const ORDER_STATUS_BY_ROLE = {
  owner: [
    "confirmed",
    "preparing",
    "ready_for_pickup",
    "cancelled",
  ],
  deliveryboy: [
    "picked_up",
    "on_the_way",
    "delivered",
  ],
};

export const placeOrder = async (req, res) => {
  try {
    const { shopId, items, deliveryAddress, paymentMethod, notes, customerLocation } = req.body;

    if (!shopId || !Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        message: "Shop, items and delivery address are required",
      });
    }

    const shop = await Shop.findById(shopId).populate("owner");

    if (!shop) {
      return res.status(404).json({
        message: "Shop not found",
      });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    const deliveryFee = subtotal > 399 ? 0 : 39;
    const taxes = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + deliveryFee + taxes).toFixed(2));

    const order = await Order.create({
      user: req.userId,
      shop: shop._id,
      owner: shop.owner?._id,
      items: items.map((item) => ({
        item: item.itemId,
        name: item.name,
        image: item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      deliveryAddress,
      paymentMethod: paymentMethod || "cod",
      notes: notes || "",
      subtotal,
      deliveryFee,
      taxes,
      totalAmount,
      customerLocation: {
        lat: customerLocation?.lat ?? null,
        lng: customerLocation?.lng ?? null,
        address: deliveryAddress,
        updatedAt: new Date(),
      },
      shopLocation: {
        lat: shop.location?.lat ?? null,
        lng: shop.location?.lng ?? null,
        address: shop.address,
        updatedAt: new Date(),
      },
    });

    const populatedOrder = await populateOrderQuery(Order.findById(order._id));

    return res.status(201).json(populatedOrder);
  } catch (error) {
    console.log("PLACE ORDER ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await populateOrderQuery(
      Order.find({ user: req.userId }).sort({ createdAt: -1 })
    );

    return res.status(200).json(orders);
  } catch (error) {
    console.log("GET MY ORDERS ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await populateOrderQuery(
      Order.find({ owner: req.userId }).sort({ createdAt: -1 })
    );

    return res.status(200).json(orders);
  } catch (error) {
    console.log("GET OWNER ORDERS ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await populateOrderQuery(
      Order.find({
        $or: [
          { deliveryBoy: req.userId },
          {
            deliveryBoy: null,
            status: {
              $in: ["placed", "confirmed", "preparing", "ready_for_pickup"],
            },
          },
        ],
      }).sort({ createdAt: -1 })
    );

    return res.status(200).json(orders);
  } catch (error) {
    console.log("GET DELIVERY ORDERS ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedStatuses = ORDER_STATUS_BY_ROLE[normalizeRole(user.role)] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status not allowed for this role",
      });
    }

    const filter =
      normalizeRole(user.role) === "owner"
        ? { _id: orderId, owner: req.userId }
        : { _id: orderId, deliveryBoy: req.userId };

    const order = await Order.findOneAndUpdate(
      filter,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const populatedOrder = await populateOrderQuery(Order.findById(order._id));

    return res.status(200).json(populatedOrder);
  } catch (error) {
    console.log("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    const user = await User.findById(req.userId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!user || normalizeRole(user.role) !== "deliveryboy") {
      return res.status(403).json({
        message: "Only delivery partners can claim orders",
      });
    }

    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: "This order can no longer be assigned",
      });
    }

    if (order.deliveryBoy && String(order.deliveryBoy) !== String(req.userId)) {
      return res.status(400).json({
        message: "Order already claimed",
      });
    }

    if (order.deliveryBoy && String(order.deliveryBoy) === String(req.userId)) {
      const populatedExistingOrder = await populateOrderQuery(
        Order.findById(order._id)
      );

      return res.status(200).json(populatedExistingOrder);
    }

    order.deliveryBoy = req.userId;

    if (["placed", "confirmed", "preparing", "ready_for_pickup"].includes(order.status)) {
      order.status = "picked_up";
    }

    await order.save();

    const populatedOrder = await populateOrderQuery(Order.findById(order._id));

    return res.status(200).json(populatedOrder);
  } catch (error) {
    console.log("ASSIGN DELIVERY ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateDeliveryLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng, address } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      deliveryBoy: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Assigned order not found",
      });
    }

    order.deliveryPartnerLocation = {
      lat: lat ?? null,
      lng: lng ?? null,
      address: address || order.deliveryPartnerLocation?.address || "",
      updatedAt: new Date(),
    };

    if (order.status === "picked_up") {
      order.status = "on_the_way";
    }

    await order.save();

    const populatedOrder = await populateOrderQuery(Order.findById(order._id));

    return res.status(200).json(populatedOrder);
  } catch (error) {
    console.log("UPDATE DELIVERY LOCATION ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
