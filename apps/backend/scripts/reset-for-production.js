require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Models
const Partner = require('../models/Partner');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/onspot';

async function resetDatabase() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: false, // Prevent index creation hanging
        });
        console.log(`Connected to ${mongoose.connection.db.databaseName}`);

        console.log('⚠ WARNING: This will delete ALL Partner, Customer, Service, Product and Audit data.');
        console.log('Starting reset in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('Deleting Partners...');
        const p = await Partner.deleteMany({});
        console.log(`Deleted ${p.deletedCount} partners.`);

        console.log('Deleting Customers...');
        const c = await Customer.deleteMany({});
        console.log(`Deleted ${c.deletedCount} customers.`);

        console.log('Deleting Services (Sales)...');
        const s = await Service.deleteMany({});
        console.log(`Deleted ${s.deletedCount} services.`);

        // Check if Product model file exists before trying to delete (just in case)
        try {
            const pr = await Product.deleteMany({});
            console.log(`Deleted ${pr.deletedCount} products.`);
        } catch (e) {
            console.log('Product deletion skipped or failed (maybe model issue):', e.message);
        }

        console.log('Deleting Audit Logs...');
        const a = await AuditLog.deleteMany({});
        console.log(`Deleted ${a.deletedCount} audit logs.`);

        console.log('✓ Database reset complete. Admin and SystemSettings preserved.');

    } catch (error) {
        console.error('Reset failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

resetDatabase();
