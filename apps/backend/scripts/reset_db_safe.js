const mongoose = require('mongoose');
require('dotenv').config();

const models = {
    Admin: require('../models/Admin'),
    AuditLog: require('../models/AuditLog'),
    Customer: require('../models/Customer'),
    Employee: require('../models/Employee'),
    Inventory: require('../models/Inventory'),
    Partner: require('../models/Partner'),
    Product: require('../models/Product'),
    Resource: require('../models/Resource'),
    Service: require('../models/Service'),
    SystemSetting: require('../models/SystemSetting'),
    Transaction: require('../models/Transaction')
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:OnSpotDB2026!@localhost:27017/onspot?authSource=admin';

async function resetDatabase() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const collectionsToClear = [
            'AuditLog',
            'Customer',
            'Employee',
            'Inventory',
            'Partner',
            'Product',
            'Resource',
            'Service',
            'Transaction'
        ];

        console.log('Starting data reset...');

        for (const modelName of collectionsToClear) {
            const Model = models[modelName];
            if (Model) {
                const count = await Model.deleteMany({});
                console.log(`Cleared ${modelName}: ${count.deletedCount} documents deleted.`);
            } else {
                console.warn(`Model ${modelName} not found.`);
            }
        }

        console.log('Database reset complete. Admin and SystemSetting collections preserved.');

    } catch (error) {
        console.error('Reset failed:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Database connection closed.');
        }
    }
}

resetDatabase();
