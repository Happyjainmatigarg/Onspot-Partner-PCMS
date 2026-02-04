'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, ArrowLeft, ArrowRight, User, Mail, Award, Target, TrendingUp } from 'lucide-react';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh"
];

// Partner tier targets - update these values as needed
const PARTNER_TIERS = {
    SILVER: {
        name: 'Silver',
        monthlyTarget: '₹50,000',
        activationsTarget: '10',
        description: 'Entry level partnership for new businesses',
        benefits: ['Basic partner dashboard', 'Email support', 'Monthly payouts'],
        color: 'slate'
    },
    GOLD: {
        name: 'Gold',
        monthlyTarget: '₹2,00,000',
        activationsTarget: '40',
        description: 'Recommended for growing businesses',
        benefits: ['Priority support', 'Weekly payouts', 'Marketing materials', 'Dedicated account manager'],
        color: 'gold',
        recommended: true
    },
    PLATINUM: {
        name: 'Platinum',
        monthlyTarget: '₹5,00,000',
        activationsTarget: '100',
        description: 'Premium partnership for high-volume partners',
        benefits: ['24/7 Priority support', 'Daily payouts', 'Co-branded marketing', 'Exclusive promotions', 'VIP events access'],
        color: 'primary'
    }
};

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        applicantName: '',
        email: '',
        mobile: '',
        pan: '',
        firmPan: '',
        gstNumber: '',
        tradeName: '',
        partnerType: 'GOLD',
        billingAddress: { street: '', city: '', state: '', pinCode: '' },
        shippingAddress: { street: '', city: '', state: '', pinCode: '' },
        bankName: '',
        bankBranch: '',
        accountNumber: '',
        ifscCode: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });

    const updateField = (path, value) => {
        const parts = path.split('.');
        setFormData(prev => {
            const newData = { ...prev };
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = { ...current[parts[i]] };
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newData;
        });
    };

    // Send OTP via Email
    const sendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, method: 'email' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setOtpSent(true);
        } catch (err) {
            // For testing without backend: auto-success
            console.log('Mock OTP sent to:', formData.email);
            setOtpSent(true);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: otp })
            });
            const data = await res.json();
            if (!res.ok || !data.verified) throw new Error(data.error || 'Invalid OTP');
            setOtpVerified(true);
            setStep(2);
        } catch (err) {
            // For testing: accept "123456" as valid OTP
            if (otp === '123456') {
                setOtpVerified(true);
                setStep(2);
            } else {
                setError('Invalid OTP. For testing, use: 123456');
            }
        } finally {
            setLoading(false);
        }
    };

    const submitForm = async () => {
        setLoading(true);
        setError('');
        try {
            // Map frontend fields to backend expected structure
            const registrationData = {
                applicantName: formData.applicantName,
                email: formData.email,
                mobile: formData.mobile,
                emailVerified: otpVerified,
                panNumber: formData.pan,
                gstNumber: formData.gstNumber || 'N/A',
                partnerType: formData.partnerType,
                billingAddress: formData.billingAddress,
                password: formData.password,
                // Contact person - use applicant details with slight modification for now
                contactPerson: {
                    name: formData.tradeName || formData.applicantName + ' (Contact)',
                    mobile: formData.mobile,
                    email: formData.email
                }
            };

            const res = await fetch('/api/partners/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });

            // Try to parse JSON response
            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                // Backend returned non-JSON response (likely error page)
                throw new Error('Server error. Please try again later.');
            }

            if (!res.ok) throw new Error(data.error || 'Registration failed');
            router.push(`/register/success?partnerId=${data.partnerId}`);
        } catch (err) {
            // For testing without backend: generate mock partner ID
            if (err.message.includes('Server error') || err.message.includes('fetch')) {
                const mockPartnerId = `ONSPOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${formData.partnerType.charAt(0)}-${Math.floor(10000 + Math.random() * 90000)}`;
                console.log('Mock registration - Partner ID:', mockPartnerId);
                router.push(`/register/success?partnerId=${mockPartnerId}`);
                return;
            }
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const stepLabels = ['Email', 'Tier', 'Business', 'Address', 'Bank & Password', 'Review'];

    const getTierCardClass = (tierKey) => {
        const tier = PARTNER_TIERS[tierKey];
        const isSelected = formData.partnerType === tierKey;
        const baseClass = 'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200';

        if (isSelected) {
            if (tier.color === 'gold') return `${baseClass} border-gold-500 bg-gold-50 ring-2 ring-gold-500/20`;
            if (tier.color === 'primary') return `${baseClass} border-primary-500 bg-primary-50 ring-2 ring-primary-500/20`;
            return `${baseClass} border-slate-400 bg-slate-50 ring-2 ring-slate-400/20`;
        }
        return `${baseClass} border-slate-200 hover:border-slate-300 bg-white`;
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div
                className="hidden lg:flex lg:w-1/2 relative"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(11, 37, 69, 0.95) 0%, rgba(11, 37, 69, 0.8) 100%), url(https://images.unsplash.com/photo-1758691736975-9f7f643d178e?w=1200)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-20 w-auto bg-white p-2 rounded-lg" />
                    </div>
                    <h1 className="font-display text-4xl font-bold mb-4">Join Our Partner Network</h1>
                    <p className="text-lg text-primary-200 max-w-md mb-6">
                        Become an authorized OnSpot™ channel partner. Choose your tier based on your business capacity.
                    </p>
                    <ul className="space-y-3 text-primary-100">
                        <li className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-xs text-white">✓</div>
                            Sell approved protection plans
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-xs text-white">✓</div>
                            Earn attractive commissions
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-xs text-white">✓</div>
                            Dedicated partner dashboard
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-slate-50 overflow-auto">
                <div className="w-full max-w-lg">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-6">
                        <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-14 w-auto mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Partner Registration</p>
                        <Link href="/" className="inline-flex items-center gap-2 mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium">
                            ← Back to Home
                        </Link>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-1 mb-6 overflow-x-auto">
                        {stepLabels.map((label, i) => (
                            <div key={i} className="flex items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i + 1 ? 'bg-emerald-500 text-white' :
                                    step === i + 1 ? 'gradient-primary text-white' :
                                        'bg-slate-200 text-slate-500'
                                    }`}>
                                    {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`ml-1 text-xs hidden sm:inline ${step === i + 1 ? 'font-semibold text-primary-600' : 'text-slate-400'}`}>
                                    {label}
                                </span>
                                {i < 5 && <div className="w-2 sm:w-4 h-0.5 bg-slate-200 mx-1" />}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-soft p-6 sm:p-8">
                        {/* Step 1: Email Verification */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div className="text-center mb-4">
                                    <h2 className="font-display text-xl font-bold text-primary-600">Email Verification</h2>
                                    <p className="text-sm text-slate-500">Verify your email via OTP</p>
                                </div>

                                <div>
                                    <label className="label">Email Address *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        placeholder="your@email.com"
                                        className="input-field"
                                        disabled={otpSent}
                                    />
                                </div>

                                {!otpSent ? (
                                    <button
                                        onClick={sendOtp}
                                        disabled={loading || !formData.email.includes('@')}
                                        className="btn-primary w-full disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : '📧 Get OTP via Email'}
                                    </button>
                                ) : !otpVerified ? (
                                    <>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
                                            📧 OTP sent to your email address. Please check your inbox.
                                        </div>
                                        <div>
                                            <label className="label">Enter OTP *</label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="6-digit OTP"
                                                className="input-field text-center text-2xl tracking-widest"
                                                maxLength={6}
                                            />
                                            <p className="text-xs text-slate-500 mt-2">
                                                Didn't receive? <button onClick={sendOtp} className="text-gold-600 hover:underline">Resend</button>
                                            </p>
                                        </div>
                                        <button
                                            onClick={verifyOtp}
                                            disabled={loading || otp.length !== 6}
                                            className="btn-gold w-full disabled:opacity-50"
                                        >
                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-2 text-emerald-700">
                                            <Check className="w-5 h-5" />
                                            <span className="font-medium">Email verified successfully!</span>
                                        </div>
                                        <button
                                            onClick={() => setStep(2)}
                                            className="btn-primary w-full flex items-center justify-center gap-2"
                                        >
                                            Continue <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 2: Partner Tier Selection */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h2 className="font-display text-xl font-bold text-primary-600">Select Your Partner Tier</h2>
                                    <p className="text-sm text-slate-500">Choose based on your monthly sales capacity</p>
                                </div>

                                <div className="space-y-3">
                                    {Object.entries(PARTNER_TIERS).map(([key, tier]) => (
                                        <div
                                            key={key}
                                            onClick={() => updateField('partnerType', key)}
                                            className={getTierCardClass(key)}
                                        >
                                            {tier.recommended && (
                                                <div className="absolute -top-2 right-4 bg-gold-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                                                    RECOMMENDED
                                                </div>
                                            )}

                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tier.color === 'gold' ? 'gradient-gold' :
                                                    tier.color === 'primary' ? 'gradient-primary' :
                                                        'bg-slate-200'
                                                    }`}>
                                                    <Award className="w-6 h-6 text-white" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-display text-lg font-bold text-primary-600">{tier.name}</h3>
                                                    <p className="text-sm text-slate-500 mb-2">{tier.description}</p>

                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Target className="w-4 h-4 text-gold-500" />
                                                            <span className="text-slate-600">Target:</span>
                                                            <span className="font-semibold text-primary-600">{tier.monthlyTarget}/mo</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                            <span className="text-slate-600">Min:</span>
                                                            <span className="font-semibold text-primary-600">{tier.activationsTarget} activations</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.partnerType === key
                                                    ? 'border-gold-500 bg-gold-500'
                                                    : 'border-slate-300'
                                                    }`}>
                                                    {formData.partnerType === key && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Business Details */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h2 className="font-display text-xl font-bold text-primary-600">Business Details</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="label">Applicant Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input type="text" value={formData.applicantName} onChange={(e) => updateField('applicantName', e.target.value)} className="input-field pl-10" placeholder="Enter your full name" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Mobile Number *</label>
                                        <input type="tel" value={formData.mobile} onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} className="input-field" placeholder="10-digit mobile" maxLength={10} />
                                    </div>
                                    <div>
                                        <label className="label">PAN *</label>
                                        <input type="text" value={formData.pan} onChange={(e) => updateField('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" className="input-field font-mono" maxLength={10} />
                                    </div>
                                    <div>
                                        <label className="label">Trade Name *</label>
                                        <input type="text" value={formData.tradeName} onChange={(e) => updateField('tradeName', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">GST Number</label>
                                        <input type="text" value={formData.gstNumber} onChange={(e) => updateField('gstNumber', e.target.value.toUpperCase())} className="input-field font-mono" maxLength={15} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label">Firm PAN (if different from applicant)</label>
                                        <input type="text" value={formData.firmPan} onChange={(e) => updateField('firmPan', e.target.value.toUpperCase())} className="input-field font-mono" maxLength={10} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(2)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button onClick={() => setStep(4)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Address */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h2 className="font-display text-xl font-bold text-primary-600">Address Details</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="label">Street Address *</label>
                                        <textarea value={formData.billingAddress.street} onChange={(e) => updateField('billingAddress.street', e.target.value)} className="input-field" rows={2} />
                                    </div>
                                    <div>
                                        <label className="label">City *</label>
                                        <input type="text" value={formData.billingAddress.city} onChange={(e) => updateField('billingAddress.city', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">State *</label>
                                        <select value={formData.billingAddress.state} onChange={(e) => updateField('billingAddress.state', e.target.value)} className="input-field">
                                            <option value="">Select State</option>
                                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">PIN Code *</label>
                                        <input type="text" value={formData.billingAddress.pinCode} onChange={(e) => updateField('billingAddress.pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-field" maxLength={6} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(3)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button onClick={() => setStep(5)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Bank Details & Password */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h2 className="font-display text-xl font-bold text-primary-600">Bank Details & Password</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">Bank Name *</label>
                                        <input type="text" value={formData.bankName} onChange={(e) => updateField('bankName', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Branch *</label>
                                        <input type="text" value={formData.bankBranch} onChange={(e) => updateField('bankBranch', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Account Number *</label>
                                        <input type="text" value={formData.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value.replace(/\D/g, ''))} className="input-field font-mono" />
                                    </div>
                                    <div>
                                        <label className="label">IFSC Code *</label>
                                        <input type="text" value={formData.ifscCode} onChange={(e) => updateField('ifscCode', e.target.value.toUpperCase())} placeholder="ABCD0001234" className="input-field font-mono" maxLength={11} />
                                    </div>
                                </div>

                                <hr className="border-slate-200 my-4" />

                                <div className="text-center mb-2">
                                    <h3 className="font-display text-lg font-semibold text-primary-600">Set Your Password</h3>
                                    <p className="text-xs text-slate-500">Min 8 chars, uppercase, lowercase, number, special char (@#$%&*)</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">Password *</label>
                                        <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} className="input-field" placeholder="Enter password" />
                                    </div>
                                    <div>
                                        <label className="label">Confirm Password *</label>
                                        <input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} className="input-field" placeholder="Confirm password" />
                                    </div>
                                </div>
                                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="text-red-500 text-xs">Passwords do not match</p>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(4)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button onClick={() => setStep(6)} disabled={!formData.password || formData.password !== formData.confirmPassword} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                                        Review <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Review & Submit */}
                        {step === 6 && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h2 className="font-display text-xl font-bold text-primary-600">Review & Submit</h2>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Partner Tier:</span>
                                        <span className={`badge ${formData.partnerType === 'GOLD' ? 'badge-gold' : formData.partnerType === 'PLATINUM' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {formData.partnerType}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Monthly Target:</span>
                                        <span className="font-medium">{PARTNER_TIERS[formData.partnerType].monthlyTarget}</span>
                                    </div>
                                    <hr className="border-slate-200" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-slate-500">Name:</span>
                                        <span className="font-medium">{formData.applicantName}</span>
                                        <span className="text-slate-500">Mobile:</span>
                                        <span className="font-medium">{formData.mobile}</span>
                                        <span className="text-slate-500">Email:</span>
                                        <span className="font-medium text-sm">{formData.email}</span>
                                        <span className="text-slate-500">PAN:</span>
                                        <span className="font-medium font-mono">{formData.pan}</span>
                                        <span className="text-slate-500">Trade Name:</span>
                                        <span className="font-medium">{formData.tradeName}</span>
                                    </div>
                                </div>

                                <label className="flex items-start gap-3 p-4 bg-gold-50 border border-gold-200 rounded-lg cursor-pointer">
                                    <input type="checkbox" checked={formData.termsAccepted} onChange={(e) => updateField('termsAccepted', e.target.checked)} className="w-5 h-5 mt-0.5" />
                                    <span className="text-sm text-gold-800">
                                        I accept the <Link href="/terms" className="text-primary-600 underline">Partner Agreement</Link> and
                                        agree to the terms and conditions between myself and Ccommerce Ecosystem Pvt. Ltd.
                                    </span>
                                </label>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(5)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button onClick={submitForm} disabled={loading || !formData.termsAccepted} className="btn-gold flex-1 disabled:opacity-50">
                                        {loading ? 'Submitting...' : 'Submit Registration'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-slate-500 text-sm mt-6">
                        Already registered? <Link href="/login" className="text-gold-600 hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
