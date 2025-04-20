require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { createHandler } = require("graphql-http/lib/use/express");
const schema = require("./graphql/schema");
const rootValue = require("./graphql/resolvers");

const app = express();

app.use("/graphql", createHandler({ schema, rootValue }));

const port = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI).then(() => {
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}/graphql`);
	});
});
