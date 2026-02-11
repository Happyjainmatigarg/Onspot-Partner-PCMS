const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Product = require('../models/Product');
const Partner = require('../models/Partner');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onspot_ecosystem';

async function debugData() {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.error('Connected to MongoDB'); // Using stderr to ensure visibility

        const customerId = 'CUST-9896220728-0QEK'; // ID from user report

        console.log(`\n--- Searching for Customer: ${customerId} ---`);
        const customer = await Customer.findOne({ customerId });
        console.log('Customer found:', customer ? 'YES' : 'NO');
        if (customer) console.log(JSON.stringify(customer, null, 2));

        console.log(`\n--- Searching for Service with customerId: ${customerId} ---`);
        const service = await Service.findOne({ customerId });
        console.log('Service found:', service ? 'YES' : 'NO');
        if (service) console.log(JSON.stringify(service, null, 2));

        console.log(`\n--- Searching for Product with customerId: ${customerId} ---`);
        const product = await Product.findOne({ customerId });
        console.log('Product found:', product ? 'YES' : 'NO');
        if (product) console.log(JSON.stringify(product, null, 2));

        console.log(`\n--- Searching for Partner with customerId: ${customerId} ---`);
        // Note: Partner wouldn't have customerId, checking logic usually goes the other way or via partnerId from customer
        if (customer && customer.partnerId) {
            console.log(`Checking Partner ID from customer: ${customer.partnerId}`);
            const partner = await Partner.findOne({ partnerId: customer.partnerId });
            console.log('Partner found:', partner ? 'YES' : 'NO');
            if (partner) console.log(JSON.stringify(partner, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

debugData();
