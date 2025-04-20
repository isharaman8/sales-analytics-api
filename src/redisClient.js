const redis = require("redis");
const client = redis.createClient({
	url: "redis://localhost:6379",
});

client.on("connect", () => {
	console.log("✅ Redis client connected");
});

client.on("error", (err) => {
	console.error("❌ Redis client error:", err);
});

client.on("ready", () => {
	console.log("✅ Redis client ready");
});

client.on("end", () => {
	console.log("ℹ️ Redis client connection ended");
});

client.connect().catch(console.error);

module.exports = client;
