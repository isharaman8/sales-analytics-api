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

  type Query {
    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [Product!]
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
    getOrders: [Order!]  # New 'orders' query added
  }
`);
