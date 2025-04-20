const Order = require("../models/order");
const { randomUUID } = require("crypto");
const client = require("../redisClient");

const cacheSalesAnalytics = (key, data) => {
	client.setEx(key, 3600, JSON.stringify(data));
};

const getCachedSalesAnalytics = async (key) => {
	return await client.get(key);
};

module.exports = {
	async getCustomerSpending({ customerId }) {
		const data = await Order.aggregate([
			{
				$match: {
					customerId,
					status: "completed",
				},
			},
			{
				$group: {
					_id: null,
					totalSpent: { $sum: "$totalAmount" },
					avgOrderValue: { $avg: "$totalAmount" },
					lastOrderDate: { $max: "$orderDate" },
				},
			},
		]);

		if (data.length === 0) return null;

		return {
			customerId,
			totalSpent: data[0].totalSpent,
			averageOrderValue: data[0].avgOrderValue,
			lastOrderDate: data[0].lastOrderDate.toISOString(),
		};
	},

	async getTopSellingProducts({ limit }) {
		const data = await Order.aggregate([
			{ $unwind: "$products" },
			{
				$group: {
					_id: "$products.productId",
					totalSold: { $sum: "$products.quantity" },
				},
			},
			{ $sort: { totalSold: -1 } },
			{ $limit: limit },
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "_id",
					as: "product",
				},
			},
			{ $unwind: "$product" },
			{
				$project: {
					productId: "$_id",
					name: "$product.name",
					totalSold: 1,
				},
			},
		]);

		return data;
	},

	async getSalesAnalytics({ startDate, endDate }) {
		const cacheKey = `sales-analytics:${startDate}:${endDate}`;
		const cachedData = await getCachedSalesAnalytics(cacheKey);

		if (cachedData) {
			console.log("returning cached data");

			return JSON.parse(cachedData);
		}

		const start = new Date(startDate);
		const end = new Date(endDate);

		const data = await Order.aggregate([
			{
				$match: {
					orderDate: { $gte: start, $lte: end },
					status: "completed",
				},
			},
			{ $unwind: "$products" },
			{
				$lookup: {
					from: "products",
					localField: "products.productId",
					foreignField: "_id",
					as: "productInfo",
				},
			},
			{ $unwind: "$productInfo" },
			{
				$group: {
					_id: "$productInfo.category",
					revenue: {
						$sum: {
							$multiply: ["$products.quantity", "$products.priceAtPurchase"],
						},
					},
				},
			},
		]);

		const totalRevenue = data.reduce((sum, cat) => sum + cat.revenue, 0);

		const completedOrders = await Order.countDocuments({
			status: "completed",
			orderDate: { $gte: start, $lte: end },
		});

		const analyticsData = {
			totalRevenue,
			completedOrders,
			categoryBreakdown: data.map((item) => ({
				category: item._id,
				revenue: item.revenue,
			})),
		};

		cacheSalesAnalytics(cacheKey, analyticsData);

		return analyticsData;
	},
	async getOrders({ page, limit }) {
		const skip = (page - 1) * limit;
		const orders = await Order.find().skip(skip).limit(limit);
		return orders;
	},
	async placeOrder({ order }) {
		order["_id"] = randomUUID();
		order["status"] = "pending";
		order["orderDate"] = new Date();

		const newOrder = new Order(order);
		await newOrder.save();
		return newOrder;
	},
};
