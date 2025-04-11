import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let token; // Store authentication token

// Before any tests, connect to the database and log in to get an auth token
beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Log in as a test user to get an authentication token
    const res = await request(app)
        .post('/auth/login')
        .send({ username: 'an3334382@gmail.com', password: 'password123' });
    token = res.body.token;
});

// After all tests, disconnect from the database
afterAll(async () => {
    await mongoose.connection.close();
});