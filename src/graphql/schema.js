const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type Product {
    productId: ID!
    name: String!
    totalSold: Int!
  }

  type CategoryRevenue {
    category: String!
    revenue: Float!
  }

  type CustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: String!
  }

  type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [CategoryRevenue!]!
  }

  type Order {
    _id: ID!
    customerId: String!
    products: [Product!]!
    totalAmount: Float!
    status: String!
    orderDate: String!
  }

  input ProductInput {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }

  input OrderInput {
    customerId: String!
    products: [ProductInput!]!
    totalAmount: Float!
  }

  type Query {
    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [Product!]
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
    getOrders(page: Int!, limit: Int!): [Order!]  # Added pagination
  }

  type Mutation {
    placeOrder(order: OrderInput!): Order!  # Mutation to place an order
  }
`);
