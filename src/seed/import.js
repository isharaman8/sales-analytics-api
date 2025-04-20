const mongoose = require("mongoose");
const csv = require("csvtojson");
const path = require("path");
const dotenv = require("dotenv");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Order = require("../models/order");

dotenv.config();

const fixString = (str) => str.replace(/'/g, '"');

const MONGO_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/salesdb";

const loadData = async () => {
	const customers = await csv().fromFile(
		path.join(__dirname, "../data/customers.csv")
	);
	const products = await csv().fromFile(
		path.join(__dirname, "../data/products.csv")
	);
	const ordersRaw = await csv().fromFile(
		path.join(__dirname, "../data/orders.csv")
	);

	const orders = ordersRaw.map((order) => ({
		...order,
		customerId: order.customerId,
		products: JSON.parse(fixString(order.products)),
		totalAmount: parseFloat(order.totalAmount),
		orderDate: new Date(order.orderDate),
		status: order.status,
	}));

	return { customers, products, orders };
};

const seedDB = async () => {
	await mongoose.connect(MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	console.log("🚀 Connected to MongoDB");

	const { customers, products, orders } = await loadData();

	await Customer.deleteMany();
	await Product.deleteMany();
	await Order.deleteMany();

	await Customer.insertMany(customers);
	await Product.insertMany(products);
	await Order.insertMany(orders);

	console.log("✅ Seeded customers, products, and orders successfully!");
	mongoose.disconnect();
};

seedDB();
