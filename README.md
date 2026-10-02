Dessert Delight

A full-stack artisanal dessert e-commerce platform for browsing desserts, managing a shopping cart, placing orders, submitting inquiries, and collecting customer feedback.

Built with HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, MongoDB, and Mongoose.

---

Overview

Dessert Delight provides a complete online ordering experience with a responsive frontend and RESTful backend.

The application supports:

* Dessert catalog and category filtering
* Live dessert search
* Dessert quick-view functionality
* Shopping cart with persistent storage
* Quantity management and order calculation
* Checkout and order creation
* Order tracking
* Contact and catering inquiries
* Customer feedback and ratings
* MongoDB integration with fallback demo storage

---

Tech Stack

Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)
* LocalStorage API
* Responsive design

Backend

* Node.js
* Express.js
* RESTful APIs
* Mongoose

Database

* MongoDB
* MongoDB Atlas

Development

* npm
* Git
* GitHub

---

Features

Dessert Catalog

* Browse available desserts
* Category-based filtering
* Live search
* Dessert details and tasting notes
* Dynamic product cards

Shopping Cart

* Add and remove desserts
* Increase or decrease quantities
* Automatic subtotal calculation
* Delivery charge calculation
* Persistent cart using LocalStorage

Checkout

* Customer information
* Delivery address
* Payment method selection
* Order validation
* Order confirmation
* Unique order IDs

Order Tracking

* Retrieve orders using the order ID
* Display order status
* View order details and total amount

Customer Feedback

* Submit ratings from 1–5 stars
* Submit customer reviews
* Retrieve approved feedback

Contact & Catering

* Contact form
* Catering and general inquiries
* Backend validation and storage

Database Fallback

The backend attempts to connect to MongoDB. If the database is unavailable, the application can fall back to in-memory storage for demonstration purposes.

---

Project Structure

```text
dessert-delight/
│
├── index.html
├── desserts.html
├── cart.html
├── order.html
├── contact.html
├── feedback.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── data/
│   └── desserts.json
│
├── config/
│   └── db.js
│
├── models/
│   ├── Order.js
│   ├── Contact.js
│   └── Feedback.js
│
├── routes/
│   ├── orderRoutes.js
│   ├── contactRoutes.js
│   └── feedbackRoutes.js
│
├── server.js
├── package.json
├── .gitignore
└── README.md
```

---

Getting Started

Prerequisites

Make sure the following are installed:

* Node.js 16 or later
* npm
* MongoDB Community Server or MongoDB Atlas

Installation

Clone the repository:

```bash
git clone https://github.com/your-username/dessert-delight.git
cd dessert-delight
```

Install dependencies:

```bash
npm install
```

Environment Configuration

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dessert_delight
NODE_ENV=development
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dessert_delight?retryWrites=true&w=majority
```

Do not commit `.env` files or database credentials to GitHub.

Running the Application

Start the server:

```bash
npm start
```

For development with automatic reload:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5000
```

---

API

Base URL:

```text
http://localhost:5000/api
```

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| GET    | `/health`             | Check server health         |
| GET    | `/desserts`           | Retrieve desserts           |
| GET    | `/desserts?category=` | Filter desserts by category |
| GET    | `/desserts?search=`   | Search desserts             |
| POST   | `/orders`             | Create a new order          |
| GET    | `/orders/:id`         | Retrieve an order           |
| POST   | `/contact`            | Submit an inquiry           |
| GET    | `/feedback`           | Retrieve customer feedback  |
| POST   | `/feedback`           | Submit customer feedback    |

---

Example: Create an Order

Request:

```http
POST /api/orders
Content-Type: application/json
```

```json
{
  "customer": {
    "name": "Aarav Sharma",
    "phone": "9876543210",
    "email": "aarav@example.com"
  },
  "address": "42 Rosewood Lane, Flat 302",
  "city": "Bengaluru",
  "paymentMethod": "UPI",
  "items": [
    {
      "name": "Belgian Chocolate Truffle Cake",
      "price": 380,
      "quantity": 1
    }
  ],
  "subtotal": 380,
  "delivery": 40,
  "total": 420
}
```

Response:

```json
{
  "success": true,
  "message": "Order placed successfully!",
  "order": {
    "orderId": "DD1726248123456",
    "status": "Pending",
    "total": 420,
    "createdAt": "2026-09-13T11:05:00.000Z"
  }
}
```

---

Design System

The interface uses a warm editorial bakery aesthetic.

| Color           | Hex       | Usage                            |
| --------------- | --------- | -------------------------------- |
| Primary Cream   | `#F8F1E7` | Main background                  |
| Secondary Cream | `#EFE3D3` | Sections and accents             |
| Dark Cocoa      | `#4A2C20` | Primary text and buttons         |
| Medium Brown    | `#765548` | Secondary text                   |
| Muted Rose      | `#C9828D` | Accent elements                  |
| Soft Rose       | `#F3D9DC` | Rating and highlight backgrounds |
| White           | `#FFFFFF` | Cards and surfaces               |
| Deep Text       | `#2F2420` | Body text                        |

Typography uses Playfair Display for editorial headings and DM Sans for interface and body content.

---

Database Models

Order

Stores:

* Order ID
* Customer information
* Delivery address
* Items
* Payment method
* Subtotal
* Delivery charge
* Total
* Order status
* Creation timestamp

Contact

Stores customer contact and inquiry information.

Feedback

Stores:

* Customer name
* Rating
* Review
* Approval status
* Creation timestamp

---

Deployment

The application can be deployed using services such as Render or Railway.

Build Command:

```bash
npm install
```

Start Command:

```bash
node server.js
```

Environment Variables:

```env
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
NODE_ENV=production
```

The deployment platform may automatically provide the PORT value, so the server should use the environment-provided port when deployed.

---

License

This project is intended for educational and portfolio use.
