const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User =
    require('../models/User');

const router =
    express.Router();


const JWT_SECRET =
    process.env.JWT_SECRET ||
    'dessert-delight-development-secret';


// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

router.post(
    '/register',
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Name, email and password are required.'

                });

            }


            if (
                password.length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Password must contain at least 6 characters.'

                });

            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const existingUser =
                await User.findOne({
                    email:
                        normalizedEmail
                });


            if (existingUser) {

                return res.status(409).json({

                    success: false,

                    message:
                        'An account with this email already exists.'

                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            const user =
                await User.create({

                    name:
                        name.trim(),

                    email:
                        normalizedEmail,

                    password:
                        hashedPassword

                });


            const token =
                jwt.sign(

                    {
                        userId:
                            user._id,

                        email:
                            user.email
                    },

                    JWT_SECRET,

                    {
                        expiresIn:
                            '7d'
                    }

                );


            res.status(201).json({

                success: true,

                message:
                    'Account created successfully.',

                token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email

                }

            });


        } catch (error) {

            console.error(
                'Registration error:',
                error
            );


            res.status(500).json({

                success: false,

                message:
                    'Failed to create account.'

            });

        }

    }
);


// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post(
    '/login',
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Email and password are required.'

                });

            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const user =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Invalid email or password.'

                });

            }


            const passwordMatches =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Invalid email or password.'

                });

            }


            const token =
                jwt.sign(

                    {

                        userId:
                            user._id,

                        email:
                            user.email

                    },

                    JWT_SECRET,

                    {

                        expiresIn:
                            '7d'

                    }

                );


            res.status(200).json({

                success: true,

                message:
                    'Login successful.',

                token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email

                }

            });


        } catch (error) {

            console.error(
                'Login error:',
                error
            );


            res.status(500).json({

                success: false,

                message:
                    'Login failed. Please try again.'

            });

        }

    }
);


// =====================================================
// CURRENT USER
// GET /api/auth/me
// =====================================================

router.get(
    '/me',
    async (req, res) => {

        try {

            const authHeader =
                req.headers.authorization;


            if (
                !authHeader ||
                !authHeader.startsWith('Bearer ')
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Authentication token required.'

                });

            }


            const token =
                authHeader.split(' ')[1];


            const decoded =
                jwt.verify(
                    token,
                    JWT_SECRET
                );


            const user =
                await User
                    .findById(
                        decoded.userId
                    )
                    .select('-password');


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        'User not found.'

                });

            }


            res.status(200).json({

                success: true,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email

                }

            });


        } catch (error) {

            res.status(401).json({

                success: false,

                message:
                    'Invalid or expired authentication token.'

            });

        }

    }
);


module.exports =
    router;