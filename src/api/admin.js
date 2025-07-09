import AdminApi from './axios.js'

export const adminAPI = {
  register: (credentials) => AdminApi.post('/register', credentials),
  login: (credentials) => AdminApi.post('/login', credentials),
  logout: () => AdminApi.post('/logout'),
  refreshToken: () => AdminApi.post('/refresh-token'),
  getCurrentAdmin: () => AdminApi.get('/current'),
  updateAdmin: (data) => AdminApi.patch('/update-account', data),
  changePassword: (data) => AdminApi.post('/change-password', data)
}


export const categoriesAPI = {
  getCategories: () => AdminApi.get('/categories'),
  createCategory: (data) => AdminApi.post('/categories', data),
  updateCategory: (data) => AdminApi.put('/categories', data),
  deleteCategory: (category_id) => AdminApi.delete(`/categories/${category_id}`),
  getSubcategoriesByCategoryId: (category_id) => AdminApi.get(`/categories/${category_id}`),
  getProductsByCategoryId: (category_id) => AdminApi.get(`/categories/${category_id}/products`),

  getCategoryById: (id) => AdminApi.get('/categories/category', { params: { id } }),
  getPaginatedCategories: (params) => AdminApi.get(`/categories/paginated`, { params })
}

export const subcategoriesAPI = {
  getSubCategories: () => AdminApi.get('/subCategories'),
  createSubcategory: (data) => AdminApi.post('/subCategories', data),
  updateSubcategory: (data) => AdminApi.put('/subCategories', data),
  deleteSubcategory: (id) => AdminApi.delete(`/subCategories/${id}`),
  getProductsBySubcategoryId: (subcategory_id) => AdminApi.get(`/subCategories/${subcategory_id}/products`),

  getPaginatedSubcategories: (params) => AdminApi.get(`/subcategories/paginated`, { params })
}

export const productsAPI = {
  getProducts: () => AdminApi.get('/products'),
  createProduct: (data) => AdminApi.post('/products', data),
  updateProduct: (data) => AdminApi.patch('/products', data),
  getProductById: (id) => AdminApi.get(`/products/${id}`),
  deleteProduct: (id) => AdminApi.delete(`/products/${id}`),
  getProductVariants: (product_id) => AdminApi.get(`/products/${product_id}/variant`),

  getPaginatedProducts: (params) => AdminApi.get('/products/paginated', { params })
}

export const productVariantsAPI = {
  createVariant: (data) => AdminApi.post(`/productVariants`, data),
  updateVariant: (data) => AdminApi.patch('/productVariants', data),
  updateVariantStock: (data) => AdminApi.patch('/productVariants/stock', data),
  updateVariantPrice: (data) => AdminApi.patch('/productVariants/price', data),
  getVariant: (id) => AdminApi.get(`/productVariants/${id}`),
  deleteVariant: (id) => AdminApi.delete(`/productVariants/${id}`),

  getPaginatedVariants: (params) => AdminApi.get(`/productVariants/paginated`, params)
}

export const couponsAPI = {
  getAllCoupons: () => AdminApi.get(`/coupons`),
  createCoupon: (data) => AdminApi.post(`/coupons`, data),
  updateCoupon: (data) => AdminApi.patch(`/coupons`, data),
  getCoupByCode: (code) => AdminApi.get(`/coupons/code/${code}`),
  getCoupById: (id) => AdminApi.get(`/coupons/id/${id}`),
  deleteCoup: (id) => AdminApi.delete(`/coupons/id/${id}`),

  getPaginatedCoupons: (params) => AdminApi.get(`/coupons/paginated`, { params })
}

export const emailTemplatesAPI = {
  getPaginatedTemplates: (params) => AdminApi.get(`/emailTemplates`, { params }),
  createTemplate: (data) => AdminApi.post(`/emailTemplates`, data),
  updateTemplate: (data) => AdminApi.patch(`/emailTemplates`, data),
  deleteTemplate: (id) => AdminApi.delete(`/emailTemplates/delete/${id}`),
  sendMailTemplate: (data) => AdminApi.post(`/emailTemplates/send`, data)
}

export const usersAPI = {
  getUsers: () => AdminApi.get('/users'),
  getUserOrders: (id) => AdminApi.get(`/users/${id}/orders`),
  getUserById: (id) => AdminApi.get(`/users/lookup/${id}`)
}

export const ordersAPI = {
  getAllOrders: () => AdminApi.get(`/orders`),
  updateOrderPaymentStatus: (data) => AdminApi.patch(`/orders/payment`, data),
  updateOrderDeliveryStatus: (data) => AdminApi.patch(`/orders/delivery`, data),
  getCustomerAddressById: (id) => AdminApi.get(`/orders/customer-address/${id}`),
  getOrderItems: (id) => AdminApi.get(`/orders/${id}/items`),
  getOrderById: (id) => AdminApi.get(`/orders/${id}`),

  // Pickup location management
  getPickupLocations: () => AdminApi.get(`/pickup-locations`),
  createPickupLocation: (data) => AdminApi.post(`/pickup-locations`, data),

  getDefaultPickupLocation: () => AdminApi.get(`/pickup-locations/default`),
  getPickupLocationByCity: (city) => AdminApi.get(`/pickup-locations/city/${city}`),
  getPickupLocationByState: (state) => AdminApi.get(`/pickup-locations/city/${state}`),
  getPickupLocationById: (id) => AdminApi.get(`/pickup-locations/${id}`),
  updatePickupLocation: (data) => AdminApi.patch(`/pickup-locations/${data.id}`, data),
  deletePickupLocation: (id) => AdminApi.delete(`/pickup-locations/${id}`),
  setDefaultPickupLocation: (id) => AdminApi.patch(`/pickup-locations/${id}/set-default`),

  getAvailableCouriers: (data) => AdminApi.post(`/shiprocket/calculate-rates`, data),//
  createShipment: (orderData) => AdminApi.post(`/shiprocket/create-order`, orderData),//
  assignCourier: (orderData) => AdminApi.post(`/shiprocket/assign-courier`, orderData),//
  generatePickup: (shipmentId) => AdminApi.post(`/shiprocket/generate-pickup`, { shipmentId: shipmentId }),//
  getShipmentDetails: (shipmentId) => AdminApi.get(`/shiprocket/shipment/${shipmentId}`),
  trackShipment: (params) => AdminApi.get(`/shiprocket/track`, { params }),//
  getShipmentLabel: (data) => AdminApi.post(`/shiprocket/label`, data),
  getShipmentInvoice: (data) => AdminApi.post(`/shiprocket/invoice`, data),
  getShipmentManifest: (data) => AdminApi.post(`/shiprocket/manifest`, data),
  cancelShipment: (orderIds) => AdminApi.post(`/shiprocket/cancel-shipment`, {orderIds}),
  returnShipment: (data) => AdminApi.post(`/shiprocket/return-order`, data),

}