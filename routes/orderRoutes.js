const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isDBConnected } = require('../config/db');

// In-memory fallback repository when MongoDB is not running
const inMemoryOrders = [];

// This is deliberately a short, visible demo timeline. In a production system,
// the restaurant and rider apps would update these milestones instead.
const DELIVERY_STEPS = [
  { afterSeconds: 0, status: 'Order placed', message: 'Your order has been sent to our kitchen.' },
  { afterSeconds: 5, status: 'Kitchen confirmed', message: 'Dessert Delight has accepted your order.' },
  { afterSeconds: 10, status: 'Preparing your desserts', message: 'Our pastry chefs are preparing your treats fresh.' },
  { afterSeconds: 16, status: 'Delivery partner assigned', message: 'Your delivery partner has been assigned.' },
  { afterSeconds: 24, status: 'Picked up by partner', message: 'Your order is on the way from our kitchen.' },
  { afterSeconds: 32, status: 'Arriving soon', message: 'Your delivery partner is nearby and will reach you soon.' },
  { afterSeconds: 42, status: 'Delivered', message: 'Delivered. We hope your desserts made your day sweeter!' },
];

const partners = [
  { name: 'Arjun K.', phone: '98765 43210', vehicle: 'Honda Activa • KA 01', rating: 4.9 },
  { name: 'Priya S.', phone: '99887 76655', vehicle: 'TVS Jupiter • KA 03', rating: 4.8 },
  { name: 'Rahul M.', phone: '97654 32109', vehicle: 'Royal Enfield • KA 05', rating: 4.9 },
];

function partnerFor(orderId) {
  const value = [...orderId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return partners[value % partners.length];
}

function getTrackingState(order) {
  const created = new Date(order.createdAt).getTime();
  const elapsedSeconds = Math.max(0, (Date.now() - created) / 1000);
  let currentStep = 0;
  DELIVERY_STEPS.forEach((step, index) => {
    if (elapsedSeconds >= step.afterSeconds) currentStep = index;
  });

  const completedAt = (step) => new Date(created + step.afterSeconds * 1000);
  const timeline = DELIVERY_STEPS.map((step, index) => ({
    status: step.status,
    message: step.message,
    completedAt: index <= currentStep ? completedAt(step) : null,
  }));
  const partner = currentStep >= 3 ? partnerFor(order.orderId) : null;
  const secondsRemaining = Math.max(0, DELIVERY_STEPS[DELIVERY_STEPS.length - 1].afterSeconds - elapsedSeconds);

  return {
    currentStep,
    status: DELIVERY_STEPS[currentStep].status,
    message: DELIVERY_STEPS[currentStep].message,
    timeline,
    deliveryPartner: partner,
    estimatedMinutes: currentStep >= DELIVERY_STEPS.length - 1 ? 0 : Math.max(1, Math.ceil(secondsRemaining / 60)),
    isDelivered: currentStep === DELIVERY_STEPS.length - 1,
  };
}

async function refreshOrderTracking(order) {
  const tracking = getTrackingState(order);
  const changed = order.status !== tracking.status || order.tracking?.currentStep !== tracking.currentStep;
  if (!changed) return tracking;

  if (typeof order.save === 'function') {
    order.status = tracking.status;
    order.deliveryPartner = tracking.deliveryPartner || {};
    order.tracking = {
      currentStep: tracking.currentStep,
      estimatedMinutes: tracking.estimatedMinutes,
      timeline: tracking.timeline,
    };
    await order.save();
  } else {
    order.status = tracking.status;
    order.deliveryPartner = tracking.deliveryPartner || {};
    order.tracking = {
      currentStep: tracking.currentStep,
      estimatedMinutes: tracking.estimatedMinutes,
      timeline: tracking.timeline,
    };
  }
  return tracking;
}

// Helper to generate unique order ID (e.g. DD1726248123456)
const generateOrderId = () => {
  return `DD${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
};

/**
 * @route   POST /api/orders
 * @desc    Create a new dessert order
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { customer, address, city, paymentMethod, items, subtotal, delivery, total } = req.body;

    // Validation
    if (!customer || !customer.name || !customer.phone || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer information (name, phone, email) is required.',
      });
    }

    // Phone format basic validation
    const phoneRegex = /^[0-9+ -]{8,15}$/;
    if (!phoneRegex.test(customer.phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number.',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address and city are required.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before placing an order.',
      });
    }

    // Calculate/verify totals
    const calculatedSubtotal = items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + (price * qty);
    }, 0);

    const deliveryFee = typeof delivery === 'number' ? delivery : 40;
    const finalTotal = calculatedSubtotal + deliveryFee;

    const orderId = generateOrderId();
    const orderData = {
      orderId,
      orderNumber: orderId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim().toLowerCase(),
      },
      address: address.trim(),
      city: city.trim(),
      paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'Cash on Delivery',
      items: items.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        image: item.image || '',
      })),
      subtotal: calculatedSubtotal,
      delivery: deliveryFee,
      total: finalTotal,
      status: 'Order placed',
      tracking: {
        currentStep: 0,
        estimatedMinutes: 35,
        timeline: [{
          status: DELIVERY_STEPS[0].status,
          message: DELIVERY_STEPS[0].message,
          completedAt: new Date(),
        }],
      },
      createdAt: new Date(),
    };

    if (isDBConnected()) {
      const newOrder = new Order(orderData);
      await newOrder.save();
    } else {
      inMemoryOrders.push(orderData);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: orderData,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your order. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/orders/:id/tracking
 * @desc    Get the simulated live delivery status for an order
 * @access  Public
 */
router.get('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const order = isDBConnected()
      ? await Order.findOne({ orderId: id })
      : inMemoryOrders.find((item) => item.orderId === id);

    if (!order) {
      return res.status(404).json({ success: false, message: `Order #${id} not found.` });
    }

    const tracking = await refreshOrderTracking(order);
    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      status: tracking.status,
      message: tracking.message,
      currentStep: tracking.currentStep,
      estimatedMinutes: tracking.estimatedMinutes,
      deliveryPartner: tracking.deliveryPartner,
      timeline: tracking.timeline,
      isDelivered: tracking.isDelivered,
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return res.status(500).json({ success: false, message: 'Unable to load delivery tracking.' });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by order ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let order = null;
    if (isDBConnected()) {
      order = await Order.findOne({ orderId: id });
    } else {
      order = inMemoryOrders.find(o => o.orderId === id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching order details.',
    });
  }
});

module.exports = router;
