const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Menu = require("./models/Menu");

dotenv.config();

const menuItems = [
    // =========================
    // TIFFINS
    // =========================
    {
        name: "Plain Dosa",
        category: "Tiffins",
        price: 50,
        description: "Crispy plain dosa served with chutney and sambar.",
        image: "/images/plain-dosa.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Masala Dosa",
        category: "Tiffins",
        price: 70,
        description: "Crispy dosa filled with delicious potato masala.",
        image: "/images/masala-dosa.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Onion Dosa",
        category: "Tiffins",
        price: 70,
        description: "Crispy dosa topped with fresh onions.",
        image: "/images/onion-dosa.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Idly",
        category: "Tiffins",
        price: 40,
        description: "Soft steamed idly served with chutney and sambar.",
        image: "/images/idly.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Upma",
        category: "Tiffins",
        price: 40,
        description: "Traditional South Indian upma prepared with vegetables.",
        image: "/images/upma.jpg",
        available: true,
        rating: 0
    },

    // =========================
    // LUNCH
    // =========================
    {
        name: "Veg Meals",
        category: "Lunch",
        price: 100,
        description: "Complete vegetarian meal with rice, curry and sides.",
        image: "/images/veg-meals.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Veg Biryani",
        category: "Lunch",
        price: 100,
        description: "Delicious vegetable biryani with aromatic spices.",
        image: "/images/veg-biryani.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Paneer Rice",
        category: "Lunch",
        price: 100,
        description: "Flavorful rice prepared with paneer and spices.",
        image: "/images/paneer-rice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Veg Fried Rice",
        category: "Lunch",
        price: 90,
        description: "Fried rice prepared with fresh vegetables.",
        image: "/images/veg-fried-rice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Curd Rice",
        category: "Lunch",
        price: 50,
        description: "Refreshing curd rice served with traditional seasoning.",
        image: "/images/curd-rice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Lemon Rice",
        category: "Lunch",
        price: 50,
        description: "Tangy lemon rice with aromatic spices.",
        image: "/images/lemon-rice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Chicken Meals",
        category: "Lunch",
        price: 150,
        description: "Complete meal served with chicken curry and rice.",
        image: "/images/chicken-meals.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Chicken Biryani",
        category: "Lunch",
        price: 150,
        description: "Flavorful chicken biryani prepared with aromatic spices.",
        image: "/images/chicken-biryani.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Chicken Fried Rice",
        category: "Lunch",
        price: 130,
        description: "Fried rice prepared with chicken and vegetables.",
        image: "/images/chicken-fried-rice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Egg Rice",
        category: "Lunch",
        price: 90,
        description: "Fried rice prepared with egg and vegetables.",
        image: "/images/egg-rice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Chicken 65",
        category: "Lunch",
        price: 120,
        description: "Crispy spicy chicken pieces served as a side dish.",
        image: "/images/chicken-65.jpg",
        available: true,
        rating: 0
    },

    // =========================
    // FAST FOOD
    // =========================
    {
        name: "Veg Burger",
        category: "Fast Food",
        price: 80,
        description: "Tasty vegetable burger with fresh vegetables and sauce.",
        image: "/images/burger.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Noodles",
        category: "Fast Food",
        price: 80,
        description: "Delicious noodles tossed with vegetables and sauces.",
        image: "/images/noodles.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Samosa",
        category: "Fast Food",
        price: 25,
        description: "Crispy samosa filled with spicy potato stuffing.",
        image: "/images/samosa.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Sandwich",
        category: "Fast Food",
        price: 60,
        description: "Fresh sandwich prepared with vegetables and sauce.",
        image: "/images/sandwich.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Paneer Roll",
        category: "Fast Food",
        price: 90,
        description: "Soft roll filled with spicy paneer and vegetables.",
        image: "/images/paneer-roll.jpg",
        available: true,
        rating: 0
    },
    {
        name: "French Fries",
        category: "Fast Food",
        price: 60,
        description: "Crispy golden french fries served hot.",
        image: "/images/french-fries.jpg",
        available: true,
        rating: 0
    },

    // =========================
    // DRINKS
    // =========================
    {
        name: "Fresh Lime Soda",
        category: "Drinks",
        price: 40,
        description: "Refreshing lime soda served chilled.",
        image: "/images/lime-soda.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Lemon Juice",
        category: "Drinks",
        price: 30,
        description: "Fresh and refreshing lemon juice.",
        image: "/images/lemon-juice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Cold Coffee",
        category: "Drinks",
        price: 60,
        description: "Chilled creamy cold coffee.",
        image: "/images/cold-coffee.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Mango Juice",
        category: "Drinks",
        price: 50,
        description: "Refreshing mango juice served chilled.",
        image: "/images/mango-juice.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Soft Drink",
        category: "Drinks",
        price: 40,
        description: "Refreshing chilled soft drink.",
        image: "/images/soft-drink.jpg",
        available: true,
        rating: 0
    },
    {
        name: "Buttermilk",
        category: "Drinks",
        price: 30,
        description: "Refreshing traditional buttermilk.",
        image: "/images/buttermilk.jpg",
        available: true,
        rating: 0
    }
];

const seedMenu = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Atlas connected");

        // Remove existing menu items
        await Menu.deleteMany({});

        // Insert all 28 menu items
        await Menu.insertMany(menuItems);

        console.log("28 menu items inserted successfully");

        await mongoose.connection.close();

        console.log("MongoDB connection closed");

    } catch (error) {
        console.error("Error seeding menu:", error.message);
        process.exit(1);
    }
};

seedMenu();