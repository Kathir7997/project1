# Agricart API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <clerk_session_token>
```

## Endpoints

### 🌾 Products

#### Get All Products
```http
GET /products
```

**Query Parameters:**
- `search` (optional) - Search by product name or description
- `category` (optional) - Filter by category
- `farmerId` (optional) - Filter by farmer
- `sort` (optional) - Sort order (default: `-createdAt`)

**Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "_id": "...",
      "farmerId": "clerk_farmer_id",
      "name": "Organic Tomatoes",
      "description": "Fresh organic tomatoes",
      "price": 50,
      "category": "Vegetables",
      "stock": 100,
      "images": ["url1", "url2"],
      "totalSold": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Product
```http
GET /products/:id
```

#### Create Product (Farmer Only)
```http
POST /products
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Organic Carrots",
  "description": "Fresh carrots from local farm",
  "price": 40,
  "category": "Vegetables",
  "stock": 200,
  "images": ["url1", "url2"]
}
```

#### Update Product (Farmer Only)
```http
PUT /products/:id
```

#### Delete Product (Farmer Only)
```http
DELETE /products/:id
```

#### Get Farmer's Products
```http
GET /products/farmer/:farmerId
```

---

### 🛒 Orders

#### Create Order (Consumer Only)
```http
POST /orders
```

**Body:**
```json
{
  "products": [
    {
      "productId": "product_id",
      "farmerId": "farmer_clerk_id",
      "name": "Product Name",
      "price": 50,
      "quantity": 2,
      "image": "url"
    }
  ],
  "totalAmount": 100,
  "razorpayOrderId": "order_xxx"
}
```

#### Get Consumer Orders
```http
GET /orders/consumer/:consumerId
```

#### Get Farmer Orders
```http
GET /orders/farmer/:farmerId
```

#### Update Order Status
```http
PUT /orders/:id/status
```

**Body:**
```json
{
  "paymentStatus": "completed",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

---

### 👤 Users

#### Sync User from Clerk
```http
POST /users/sync
```

**Body:**
```json
{
  "clerkId": "user_xxx",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "Farmer"
}
```

#### Get User Profile
```http
GET /users/:clerkId
```

#### Update User Profile
```http
PUT /users/:clerkId
```

**Body:**
```json
{
  "name": "Updated Name"
}
```

---

### 💳 Payment

#### Create Razorpay Order
```http
POST /payment/create-order
```

**Body:**
```json
{
  "amount": 100,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_xxx",
    "amount": 10000,
    "currency": "INR"
  }
}
```

#### Verify Payment
```http
POST /payment/verify
```

**Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

---

### 🎤 Voice Search

#### Transcribe Audio
```http
POST /voice/transcribe
```

**Content-Type:** `multipart/form-data`

**Body:**
- `audio` (file) - Audio file (mp3, wav, webm, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Audio transcribed successfully",
  "data": {
    "text": "organic tomatoes"
  }
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": "Additional error details"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

No rate limiting is currently implemented. Consider adding in production.

## Categories

Available product categories:
- Vegetables
- Fruits
- Grains
- Dairy
- Organic
- Seeds
- Tools
- Other
