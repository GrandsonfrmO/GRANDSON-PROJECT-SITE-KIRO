/**
 * In-memory store for demo orders
 * This store is shared between POST and GET endpoints to maintain demo order data
 * when the backend is unavailable
 */

// Store demo orders with order number as key
const demoOrdersStore = new Map<string, any>();

export { demoOrdersStore };
