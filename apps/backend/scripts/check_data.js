const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Service = require('../models/Service');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
require('dotenv').config();

const MONGODB_URI = 'mongodb://admin:OnSpotDB2026!@localhost:27017/onspot?authSource=admin'; // Hardcoded for local script execution
const OUTPUT_FILE = path.join(__dirname, 'debug_output.txt');

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

        const customerId = 'CUST-9896220728-0QEK';
        let output = `Checking data for ${customerId}\n`;

        const customer = await Customer.findOne({ customerId });
        output += `Customer found: ${!!customer}\n`;
        if (customer) {
            output += `Customer _id: ${customer._id}\n`;
            output += `Customer status: ${customer.status}\n`;
        }

        const serviceCount = await Service.countDocuments({ customerId });
        output += `Service count: ${serviceCount}\n`;

        const productCount = await Product.countDocuments({ customerId });
        output += `Product count: ${productCount}\n`;

        fs.writeFileSync(OUTPUT_FILE, output);
        console.log('Done writing to file');

    } catch (error) {
        fs.writeFileSync(OUTPUT_FILE, `Error: ${error.message}`);
        console.error(error);
    } finally {
        await mongoose.connection.close();
    }
}

checkData();
