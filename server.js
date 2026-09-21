require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const Menu = require("./models/Menu");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Payment = require("./models/payment");
const Feedback = require("./models/Feedback");
const User = require("./models/User");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


const app = express();

// Middleware

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("Smart Canteen Backend is running");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Smart Canteen Backend is running"
    });
});
// =====================================================
// API 3 - Get All Menu Items
// GET /api/menu
// =====================================================

app.get("/api/menu", async (req, res) => {
    try {
        const menuItems = await Menu.find();

        res.json({
            success: true,
            count: menuItems.length,
            menu: menuItems
        });

    } catch (error) {
        console.error("Get menu error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 4 - Get Single Menu Item
// GET /api/menu/:id
// =====================================================

app.get("/api/menu/:id", async (req, res) => {
    const menuId = req.params.id;

    try {
        // Find menu item in MongoDB
        const menuItem = await Menu.findById(menuId);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.json({
            success: true,
            menu: menuItem
        });

    } catch (error) {
        console.error("Get single menu item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 5 - Get Cart
// GET /api/cart
// =====================================================

app.get("/api/cart", async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.json({
                success: true,
                cart: {
                    user: userId,
                    items: [],
                    totalAmount: 0
                }
            });
        }

        res.json({
            success: true,
            cart: cart
        });

    } catch (error) {
        console.error("Get cart error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 6 - Add Item to Cart
// POST /api/cart
// =====================================================

app.post("/api/cart", async (req, res) => {
    const { userId, menuItemId, quantity } = req.body;

    // Check required fields
    if (!userId || !menuItemId || !quantity) {
        return res.status(400).json({
            success: false,
            message: "User ID, menu item ID and quantity are required"
        });
    }

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ user: userId });

        // Find the menu item
        const menuItem = await Menu.findById(menuItemId);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        // Check availability
        if (!menuItem.available) {
            return res.status(400).json({
                success: false,
                message: "Menu item is currently unavailable"
            });
        }

        // Create cart if it doesn't exist
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [],
                totalAmount: 0
            });
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: quantity
            });
        }

        // Recalculate total
        cart.totalAmount = cart.items.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );

        await cart.save();

        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            cart: cart
        });

    } catch (error) {
        console.error("Add to cart error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 7 - Update Cart Item Quantity
// PUT /api/cart/:id
// =====================================================

app.put("/api/cart/:id", async (req, res) => {
    const menuItemId = req.params.id;
    const { userId, quantity } = req.body;

    // Check required fields
    if (!userId || !quantity || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "User ID and valid quantity are required"
        });
    }

    try {
        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Find cart item using menuItem ID
        const cartItem = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        // Update quantity
        cartItem.quantity = quantity;

        // Recalculate total
        cart.totalAmount = cart.items.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );

        await cart.save();

        res.json({
            success: true,
            message: "Cart item updated successfully",
            cart: cart
        });

    } catch (error) {
        console.error("Update cart item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 8 - Delete Cart Item
// DELETE /api/cart/:id
// =====================================================

app.delete("/api/cart/:id", async (req, res) => {
    const menuItemId = req.params.id;
    const { userId } = req.body;

    // Check required fields
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    try {
        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Find item using menuItem ID
        const itemIndex = cart.items.findIndex(
            item => item.menuItem.toString() === menuItemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        // Remove item
        cart.items.splice(itemIndex, 1);

        // Recalculate total
        cart.totalAmount = cart.items.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );

        await cart.save();

        res.json({
            success: true,
            message: "Cart item removed successfully",
            cart: cart
        });

    } catch (error) {
        console.error("Delete cart item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 9 - Create Order
// POST /api/orders
// =====================================================

app.post("/api/orders", async (req, res) => {
    const { userId, paymentMethod } = req.body;

    // Check required fields
    if (!userId || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: "User ID and payment method are required"
        });
    }

    try {
        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Generate sequential token ID
        const orderCount = await Order.countDocuments();
        const tokenId = "T" + String(orderCount + 1).padStart(3, "0");

        // Create order from cart
        const order = await Order.create({
            user: userId,
            tokenId: tokenId,

            items: cart.items.map(item => ({
                menuItem: item.menuItem,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),

            totalAmount: cart.totalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: "Pending",
            status: "Placed"
        });

        // Clear cart after order is created
        cart.items = [];
        cart.totalAmount = 0;

        await cart.save();

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: order
        });

    } catch (error) {
        console.error("Create order error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 10 - Get All Orders
// GET /api/orders
// =====================================================

app.get("/api/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error("Get all orders error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 11 - Get Order by ID
// GET /api/orders/:id
// =====================================================

app.get("/api/orders/:id", async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await Order.findById(orderId)
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            order: order
        });

    } catch (error) {
        console.error("Get order by ID error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 12 - Get Admin Orders
// GET /api/admin/orders
// =====================================================

app.get("/api/admin/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error("Get admin orders error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 13 - Update Order Status
// PUT /api/admin/orders/:id/status
// =====================================================

app.put("/api/admin/orders/:id/status", async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    // Check status
    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Order status is required"
        });
    }

    // Valid statuses
    const validStatuses = [
        "Placed",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order status"
        });
    }

    try {
        // Find order in MongoDB
        const order = await Order.findById(orderId)
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Completed or Cancelled orders cannot be changed
        if (
            order.status === "Completed" ||
            order.status === "Cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: "This order can no longer be updated"
            });
        }

        // Update status
        order.status = status;

        await order.save();

        res.json({
            success: true,
            message: "Order status updated successfully",
            order: order
        });

    } catch (error) {
        console.error("Update order status error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// Admin - Add new menu item
// =====================================================
// API 14 - Add Menu Item
// POST /api/admin/menu
// =====================================================

app.post("/api/admin/menu", async (req, res) => {
    const {
        name,
        description,
        price,
        category,
        rating,
        available,
        image
    } = req.body;

    // Check required fields
    if (!name || !description || price === undefined || !category) {
        return res.status(400).json({
            success: false,
            message: "Name, description, price and category are required"
        });
    }

    try {
        const newMenuItem = await Menu.create({
            name: name,
            description: description,
            price: price,
            category: category,
            rating: rating || 0,
            available: available !== undefined ? available : true,
            image: image || ""
        });

        res.status(201).json({
            success: true,
            message: "Menu item added successfully",
            menuItem: newMenuItem
        });

    } catch (error) {
        console.error("Add menu item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 15 - Update Menu Item
// PUT /api/admin/menu/:id
// =====================================================

app.put("/api/admin/menu/:id", async (req, res) => {
    const itemId = req.params.id;

    const {
        name,
        description,
        price,
        category,
        rating,
        available,
        image
    } = req.body;

    // Check required fields
    if (!name || !description || price === undefined || !category) {
        return res.status(400).json({
            success: false,
            message: "Name, description, price and category are required"
        });
    }

    try {
        // Find and update menu item in MongoDB
        const updatedItem = await Menu.findByIdAndUpdate(
            itemId,
            {
                name: name,
                description: description,
                price: price,
                category: category,
                rating: rating !== undefined ? rating : 0,
                available: available !== undefined ? available : true,
                image: image || ""
            },
            {
                new: true,
                runValidators: true
            }
        );

        // If item doesn't exist
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.json({
            success: true,
            message: "Menu item updated successfully",
            menuItem: updatedItem
        });

    } catch (error) {
        console.error("Update menu item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 16 - Delete Menu Item
// DELETE /api/admin/menu/:id
// =====================================================

app.delete("/api/admin/menu/:id", async (req, res) => {
    const itemId = req.params.id;

    try {
        // Find and delete menu item from MongoDB
        const deletedItem = await Menu.findByIdAndDelete(itemId);

        // If item doesn't exist
        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.json({
            success: true,
            message: "Menu item deleted successfully",
            deletedItemId: deletedItem._id
        });

    } catch (error) {
        console.error("Delete menu item error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 17 - Get Menu by Category
// GET /api/menu/category/:category
// =====================================================

app.get("/api/menu/category/:category", async (req, res) => {
    const category = req.params.category;

    try {
        // Find menu items by category
        const menuItems = await Menu.find({
            category: {
                $regex: `^${category}$`,
                $options: "i"
            }
        });

        // If no items found
        if (menuItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No menu items found for this category"
            });
        }

        res.json({
            success: true,
            category: category,
            count: menuItems.length,
            menu: menuItems
        });

    } catch (error) {
        console.error("Get menu by category error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 18 - Search Menu Item
// GET /api/menu/search/:keyword
// =====================================================

app.get("/api/menu/search/:keyword", async (req, res) => {
    const keyword = req.params.keyword;

    try {
        // Search menu item names containing the keyword
        const results = await Menu.find({
            name: {
                $regex: keyword,
                $options: "i"
            }
        });

        // If no items found
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No menu items found"
            });
        }

        res.json({
            success: true,
            keyword: keyword,
            count: results.length,
            menu: results
        });

    } catch (error) {
        console.error("Search menu error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 19 - Update Menu Item Availability
// PUT /api/admin/menu/:id/availability
// =====================================================

app.put("/api/admin/menu/:id/availability", async (req, res) => {
    const itemId = req.params.id;
    const { available } = req.body;

    // Check availability field
    if (available === undefined) {
        return res.status(400).json({
            success: false,
            message: "Availability status is required"
        });
    }

    // Make sure available is boolean
    if (typeof available !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "Availability must be true or false"
        });
    }

    try {
        // Update availability in MongoDB
        const updatedItem = await Menu.findByIdAndUpdate(
            itemId,
            {
                available: available
            },
            {
                new: true,
                runValidators: true
            }
        );

        // If item doesn't exist
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.json({
            success: true,
            message: "Menu item availability updated successfully",
            menuItem: updatedItem
        });

    } catch (error) {
        console.error("Update menu availability error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 22 - Get User Orders
// GET /api/orders/user/:userId
// =====================================================

app.get("/api/orders/user/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find orders for this user in MongoDB
        const userOrders = await Order.find({
            user: userId
        })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

        // If no orders found
        if (userOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user"
            });
        }

        res.json({
            success: true,
            userId: userId,
            count: userOrders.length,
            orders: userOrders
        });

    } catch (error) {
        console.error("Get user orders error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 23 - Cancel Order
// PUT /api/orders/:id/cancel
// =====================================================

app.put("/api/orders/:id/cancel", async (req, res) => {
    const orderId = req.params.id;

    try {
        // Find order in MongoDB
        const order = await Order.findById(orderId)
            .populate("user", "name email");

        // Order not found
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Only pending orders can be cancelled
        if (order.status !== "Placed") {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be cancelled"
            });
        }

        // Cancel order
        order.status = "Cancelled";

        await order.save();

        res.json({
            success: true,
            message: "Order cancelled successfully",
            order: order
        });

    } catch (error) {
        console.error("Cancel order error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 25 - Verify Payment
// POST /api/payment/verify
// =====================================================

app.post("/api/payment/verify", async (req, res) => {
    const { paymentId, orderId, paymentStatus } = req.body;

    // Check required fields
    if (!paymentId || !orderId || !paymentStatus) {
        return res.status(400).json({
            success: false,
            message: "Payment ID, order ID and payment status are required"
        });
    }

    // Payment must be Paid
    if (paymentStatus !== "Paid") {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed",
            paymentStatus: paymentStatus
        });
    }

    try {
        // Find payment in MongoDB
        const payment = await Payment.findOne({
            paymentId: paymentId,
            orderId: orderId
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Update payment status
        payment.paymentStatus = "Paid";

        await payment.save();

        // Update order payment status
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.paymentStatus = "Paid";

        await order.save();

        res.json({
            success: true,
            message: "Payment verified successfully",
            payment: payment
        });

    } catch (error) {
        console.error("Verify payment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 26 - Get Payment by Order ID
// GET /api/payment/:orderId
// =====================================================

app.get("/api/payment/:orderId", async (req, res) => {
    const orderId = req.params.orderId;

    try {
        // Find payment in MongoDB
        const payment = await Payment.findOne({
            orderId: orderId
        }).populate("orderId");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found for this order"
            });
        }

        res.json({
            success: true,
            payment: payment
        });

    } catch (error) {
        console.error("Get payment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 27 - Submit Feedback
// POST /api/feedback
// =====================================================

app.post("/api/feedback", async (req, res) => {
    const { userId, orderId, rating, comment } = req.body;

    // Check required fields
    if (!userId || !orderId || !rating || !comment) {
        return res.status(400).json({
            success: false,
            message: "User ID, order ID, rating and comment are required"
        });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5"
        });
    }

    try {
        // Check whether user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check whether order exists
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Create feedback in MongoDB
        const feedback = await Feedback.create({
            userId: userId,
            orderId: orderId,
            rating: rating,
            comment: comment
        });

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback: feedback
        });

    } catch (error) {
        console.error("Submit feedback error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// =====================================================
// API 24 - Create Payment
// POST /api/payment/create
// =====================================================

app.post("/api/payment/create", async (req, res) => {
    const { orderId, amount, paymentMethod } = req.body;

    // Check required fields
    if (!orderId || !amount || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: "Order ID, amount and payment method are required"
        });
    }

    try {
        // Check whether order exists
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Create payment in MongoDB
        const payment = await Payment.create({
            paymentId: "PAY" + Date.now(),
            orderId: orderId,
            amount: amount,
            paymentMethod: paymentMethod,
            paymentStatus: "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            payment: payment
        });

    } catch (error) {
        console.error("Create payment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 28 - Get User Feedback
// GET /api/feedback/user/:userId
// =====================================================

app.get("/api/feedback/user/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find feedback submitted by this user
        const userFeedback = await Feedback.find({
            userId: userId
        })
            .populate("userId", "name email")
            .populate("orderId");

        if (userFeedback.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No feedback found for this user"
            });
        }

        res.json({
            success: true,
            userId: userId,
            count: userFeedback.length,
            feedback: userFeedback
        });

    } catch (error) {
        console.error("Get user feedback error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// =====================================================
// API 29 - Get All Admin Feedback
// GET /api/admin/feedback
// =====================================================

app.get("/api/admin/feedback", async (req, res) => {
    try {
        // Get all feedback from MongoDB
        const feedbackList = await Feedback.find()
            .populate("userId", "name email")
            .populate("orderId")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedbackList.length,
            feedback: feedbackList
        });

    } catch (error) {
        console.error("Get admin feedback error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});
// Start server - KEEP THIS AT THE VERY BOTTOM
// Start server - KEEP THIS AT THE VERY BOTTOM
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
});