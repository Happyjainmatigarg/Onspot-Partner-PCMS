require('dotenv').config({ path: 'apps/backend/.env' });
const { sendOTP, verifyOTP } = require('./apps/backend/services/otp');
const Redis = require('ioredis');

// MOCK Redis for testing if no local redis is available (or use real one if env var is set)
// Ideally, we should detect if we can connect to Redis, but for this script we will assume 
// the user might not have it running in their env yet, so we will try to connect and log success/fail.

async function testOTPFlow() {
    console.log('--- Starting OTP Flow Test ---');

    const testEmail = 'test@example.com';
    const testMobile = '9876543210';

    // 1. Send OTP (Email)
    console.log(`\n[1] Sending OTP to ${testEmail}...`);
    // We expect this to fail sending actual email if credentials aren't set, 
    // but the OTP generation and storage should work.
    // In dev mode, it should log to console.

    // Set NODE_ENV to development to see console logs
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
                    console.error('❌ OTP Verification Failed!');
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
        // Clean up Redis connection if the service opened one that hangs
        // Since we import the service, we can't easily close its internal redis.
        // We will just exit.
        console.log('\n--- Test Complete (Press Ctrl+C if hanging) ---');
        process.exit(0);
    }
}

testOTPFlow();
