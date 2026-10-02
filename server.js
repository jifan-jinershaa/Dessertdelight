const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB } = require('./config/db');

const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');

const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// AUTHENTICATION PAGE ROUTES
// =====================================================

// Root of the website ALWAYS opens login first.

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'login.html')
    );
});


// Login page

app.get('/login.html', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'login.html')
    );
});


// Register page

app.get('/register.html', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'register.html')
    );
});


// =====================================================
// PROTECTED HTML PAGES
// =====================================================
//
// These pages are protected on the client side through
// js/auth.js.
//
// The backend still serves them normally, while auth.js
// immediately redirects unauthenticated visitors to login.
//
// =====================================================

const protectedPages = [
    'index.html',
    'desserts.html',
    'cart.html',
    'order.html',
    'contact.html',
    'feedback.html'
];

protectedPages.forEach((page) => {

    app.get(`/${page}`, (req, res) => {

        res.sendFile(
            path.join(__dirname, page)
        );

    });

});


// =====================================================
// STATIC FILES
// =====================================================

app.use(
    express.static(
        path.join(__dirname)
    )
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {

    res.status(200).json({

        success: true,

        status: 'OK',

        message:
            'Dessert Delight API is running',

        timestamp:
            new Date().toISOString()

    });

});


// =====================================================
// DESSERTS API
// =====================================================

app.get('/api/desserts', (req, res) => {

    try {

        const dessertsFilePath =
            path.join(
                __dirname,
                'data',
                'desserts.json'
            );


        if (
            !fs.existsSync(
                dessertsFilePath
            )
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Desserts data source not found.'

            });

        }


        const rawData =
            fs.readFileSync(
                dessertsFilePath,
                'utf-8'
            );


        const desserts =
            JSON.parse(rawData);


        const {
            category,
            search
        } = req.query;


        let filtered =
            desserts;


        // Category filtering

        if (
            category &&
            category.toLowerCase() !== 'all'
        ) {

            filtered =
                filtered.filter(
                    (item) =>
                        item.category &&
                        item.category
                            .toLowerCase() ===
                        category
                            .toLowerCase()
                );

        }


        // Search filtering

        if (search) {

            const query =
                search
                    .toLowerCase()
                    .trim();


            filtered =
                filtered.filter(
                    (item) =>

                        (
                            item.name &&
                            item.name
                                .toLowerCase()
                                .includes(query)
                        )

                        ||

                        (
                            item.description &&
                            item.description
                                .toLowerCase()
                                .includes(query)
                        )
                );

        }


        res.status(200).json({

            success: true,

            count:
                filtered.length,

            desserts:
                filtered

        });


    } catch (error) {

        console.error(
            'Error reading desserts data:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Failed to retrieve desserts.'

        });

    }

});


// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
    '/api/auth',
    authRoutes
);


// =====================================================
// PROTECTED ORDER ROUTES
// =====================================================
//
// Every order request MUST contain:
//
// Authorization: Bearer <JWT>
//
// =====================================================

app.use(
    '/api/orders',
    authenticateToken,
    orderRoutes
);


// =====================================================
// CONTACT ROUTES
// =====================================================

app.use(
    '/api/contact',
    contactRoutes
);


// =====================================================
// FEEDBACK ROUTES
// =====================================================

app.use(
    '/api/feedback',
    feedbackRoutes
);


// =====================================================
// API 404
// =====================================================

app.use(
    '/api/*',
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                'API endpoint not found'

        });

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            '[Server Error]',
            err
        );


        res.status(500).json({

            success: false,

            message:
                'Internal server error occurred.',

            error:
                process.env.NODE_ENV ===
                'development'
                    ? err.message
                    : undefined

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            '========================================='
        );

        console.log(
            '     DESSERT DELIGHT SERVER              '
        );

        console.log(
            '========================================='
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `Login:  http://localhost:${PORT}/`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            '========================================='
        );

    }
);