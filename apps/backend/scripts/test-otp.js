require('dotenv').config({ path: '../.env' });
const { sendOTP, verifyOTP } = require('../services/otp');
// We don't need to require ioredis here directly if we are just calling services, 
// but if we want to mocking or setup, we might. 
// The service uses ioredis.

async function testOTPFlow() {
    console.log('--- Starting OTP Flow Test ---');

    const testEmail = 'test@example.com';
    const testMobile = '9876543210';

    // 1. Send OTP (Email)
    console.log(`\n[1] Sending OTP to ${testEmail}...`);

    // Set NODE_ENV to development to see console logs and get devOTP
    // We do this before require if the module caches env but here modules are already loaded.
    // The service checks process.env at runtime for most things, but some consts might be static.
    // Ideally validation happens at runtime.
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
        const sendResult = await sendOTP(testEmail);
        console.log('Send Result:', sendResult);

        if (sendResult.success) {
            // In dev mode, we get the devOTP back
            const otpCode = sendResult.devOTP;
            console.log(`\n[2] Retrieved OTP from dev response: ${otpCode}`);

            if (otpCode) {
                // 3. Verify OTP
                console.log(`\n[3] Verifying OTP ${otpCode} for ${testEmail}...`);
                const verifyResult = await verifyOTP(testEmail, otpCode);
                console.log('Verify Result:', verifyResult);

                if (verifyResult.success && verifyResult.verified) {
                    console.log('✅ OTP Verification Successful!');
                } else {
                    console.error('❌ OTP Verification Failed!', verifyResult);
                }

                // 4. Test Replay Attack (should fail)
                console.log('\n[4] Testing Replay Attack (should fail)...');
                const replayResult = await verifyOTP(testEmail, otpCode);
                console.log('Replay Result:', replayResult);
                if (!replayResult.success) {
                    console.log('✅ Replay Attack Prevented!');
                } else {
                    console.error('❌ Replay Attack Succeeded (Bad)!');
                }

            } else {
                console.log('⚠️ No devOTP returned (check NODE_ENV or service logic)');
            }
        } else {
            console.error('❌ Failed to send OTP:', sendResult);
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    } finally {
        process.env.NODE_ENV = originalEnv;
        console.log('\n--- Test Complete ---');
        process.exit(0);
    }
}

testOTPFlow();
