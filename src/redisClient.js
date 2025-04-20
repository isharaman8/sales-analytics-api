const redis = require("redis");

async function createRedisClient() {
	const redisUrl = process.env.REDIS_URL;

	if (!redisUrl) {
		return { is_connected: false, client: null };
	}

	const client = redis.createClient({
		url: process.env.REDIS_URL,
	});

	let is_connected = false;

	client.on("connect", () => {
		console.log("✅ Redis client connected");
		is_connected = true;
	});

	client.on("ready", () => {
		console.log("✅ Redis client ready");
	});

	client.on("error", (err) => {
		console.error("❌ Redis client error:", err);
		is_connected = false;
	});

	client.on("end", () => {
		console.log("ℹ️ Redis client connection ended");
		is_connected = false;
	});

	try {
		await client.connect();
	} catch (err) {
		console.error("❌ Failed to connect to Redis:", err);
		return { is_connected: false, client: null };
	}

	return { is_connected, client };
}

module.exports = createRedisClient;
