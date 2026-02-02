'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Check, AlertCircle, Calculator } from 'lucide-react';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh"
];

const DEVICE_TYPES = ['SMARTPHONE', 'LAPTOP', 'TABLET', 'DESKTOP', 'SMARTWATCH', 'TELEVISION', 'OTHER'];
const SERVICE_TYPES = ['ESS', 'EPS', 'CDC'];

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [partnerVerified, setPartnerVerified] = useState(false);
    const [partnerInfo, setPartnerInfo] = useState(null);
    const [serviceCost, setServiceCost] = useState(null);

    const [formData, setFormData] = useState({
        partnerId: '',
        customerName: '',
        mobile: '',
        email: '',
        address: { street: '', city: '', state: '', pinCode: '' },
        serviceType: searchParams.get('service') || 'EPS',
        device: {
            productType: 'SMARTPHONE',
            brand: '',
            model: '',
            serialNumber: '',
            purchaseValue: '',
            purchaseDate: ''
        },
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

    const verifyPartner = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/customers/verify-partner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerId: formData.partnerId })
            });
            const data = await res.json();
            if (!res.ok || !data.valid) {
                throw new Error(data.error || 'Invalid Partner ID');
            }
            setPartnerVerified(true);
            setPartnerInfo(data.partner);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateCost = async () => {
        if (!formData.device.purchaseValue || !formData.serviceType) return;
        try {
            const res = await fetch('/api/customers/calculate-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceValue: parseFloat(formData.device.purchaseValue),
                    serviceType: formData.serviceType
                })
            });
            const data = await res.json();
            if (res.ok) {
                setServiceCost(data);
            }
        } catch (err) {
            console.error('Cost calculation error:', err);
        }
    };

    useEffect(() => {
        if (formData.device.purchaseValue && formData.serviceType) {
            calculateCost();
        }
    }, [formData.device.purchaseValue, formData.serviceType]);

    const submitForm = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/customers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push(`/register/success?customerId=${data.customerId}&serviceId=${data.serviceId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Shield className="w-8 h-8 text-primary-500" />
                        <span className="text-2xl font-bold gradient-text">OnSpot™</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Device Protection Registration</h1>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {['Partner', 'Device', 'Details', 'Confirm'].map((label, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-green-500 text-white' :
                                    step === i + 1 ? 'bg-primary-500 text-white' :
                                        'bg-gray-200 text-gray-500'
                                }`}>
                                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`ml-2 text-sm ${step === i + 1 ? 'font-semibold' : 'text-gray-500'}`}>{label}</span>
                            {i < 3 && <div className="w-8 h-0.5 bg-gray-200 mx-2" />}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="card">
                    {/* Step 1: Partner ID */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Enter Partner ID</h2>
                            <p className="text-gray-600 text-sm">
                                Your Partner ID is provided by the retailer who sold your device.
                                It looks like: ONSPOT-DD-MM-YYYY-X-XXXXX
                            </p>

                            <div>
                                <label className="label">Partner ID *</label>
                                <input
                                    type="text"
                                    value={formData.partnerId}
                                    onChange={(e) => updateField('partnerId', e.target.value.toUpperCase())}
                                    placeholder="ONSPOT-DD-MM-YYYY-X-XXXXX"
                                    className="input-field font-mono"
                                    disabled={partnerVerified}
                                />
                            </div>

                            {partnerVerified && partnerInfo && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <Check className="w-5 h-5" />
                                        <span className="font-semibold">Partner Verified</span>
                                    </div>
                                    <p className="text-sm text-green-600">
                                        {partnerInfo.applicantName} • {partnerInfo.city}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={verifyPartner}
                                    disabled={loading || partnerVerified || !formData.partnerId}
                                    className="btn-secondary flex-1 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : partnerVerified ? 'Verified ✓' : 'Verify Partner'}
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!partnerVerified}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Device Details */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold">Device Details</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Device Type *</label>
                                    <select
                                        value={formData.device.productType}
                                        onChange={(e) => updateField('device.productType', e.target.value)}
                                        className="input-field"
                                    >
                                        {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Brand *</label>
                                    <input
                                        type="text"
                                        value={formData.device.brand}
                                        onChange={(e) => updateField('device.brand', e.target.value)}
                                        placeholder="Apple, Samsung, etc."
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Model Name *</label>
                                <input
                                    type="text"
                                    value={formData.device.model}
                                    onChange={(e) => updateField('device.model', e.target.value)}
                                    placeholder="iPhone 15 Pro, Galaxy S24, etc."
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label">Serial / IMEI Number *</label>
                                <input
                                    type="text"
                                    value={formData.device.serialNumber}
                                    onChange={(e) => updateField('device.serialNumber', e.target.value)}
                                    placeholder="Device serial or IMEI number"
                                    className="input-field font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Purchase Value (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.device.purchaseValue}
                                        onChange={(e) => updateField('device.purchaseValue', e.target.value)}
                                        placeholder="50000"
                                        className="input-field"
                                        min="1000"
                                        max="1000000"
                                    />
                                </div>
                                <div>
                                    <label className="label">Purchase Date *</label>
                                    <input
                                        type="date"
                                        value={formData.device.purchaseDate}
                                        onChange={(e) => updateField('device.purchaseDate', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Service Plan *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {SERVICE_TYPES.map(type => (
                                        <label
                                            key={type}
                                            className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${formData.serviceType === type
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="serviceType"
                                                value={type}
                                                checked={formData.serviceType === type}
                                                onChange={(e) => updateField('serviceType', e.target.value)}
                                                className="hidden"
                                            />
                                            <span className="font-bold">{type}</span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {type === 'ESS' ? '8%' : type === 'EPS' ? '15%' : '20%'}
                                            </p>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {serviceCost && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                                        <Calculator className="w-5 h-5" />
                                        <span className="font-semibold">Service Cost</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-800">
                                        ₹{serviceCost.serviceCost.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        {formData.serviceType} ({serviceCost.servicePercentage}% of device value)
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                                <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Customer Details */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold">Your Details</h2>

                            <div>
                                <label className="label">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => updateField('customerName', e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Mobile *</label>
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Address *</label>
                                <textarea
                                    value={formData.address.street}
                                    onChange={(e) => updateField('address.street', e.target.value)}
                                    className="input-field"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="label">City *</label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => updateField('address.city', e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">State *</label>
                                    <select
                                        value={formData.address.state}
                                        onChange={(e) => updateField('address.state', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Select</option>
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">PIN *</label>
                                    <input
                                        type="text"
                                        value={formData.address.pinCode}
                                        onChange={(e) => updateField('address.pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="input-field"
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                                <button onClick={() => setStep(4)} className="btn-primary flex-1">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirm */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold">Confirm Registration</h2>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Partner</span>
                                    <span className="font-medium">{partnerInfo?.applicantName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Device</span>
                                    <span className="font-medium">{formData.device.brand} {formData.device.model}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Value</span>
                                    <span className="font-medium">₹{parseFloat(formData.device.purchaseValue).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-medium">{formData.serviceType}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold">Service Cost</span>
                                    <span className="font-bold text-primary-600">₹{serviceCost?.serviceCost.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={formData.termsAccepted}
                                    onChange={(e) => updateField('termsAccepted', e.target.checked)}
                                    className="w-5 h-5 mt-0.5"
                                />
                                <span className="text-sm text-gray-600">
                                    I accept the <Link href="/terms" className="text-primary-600 underline">terms and conditions</Link> and
                                    agree to the service agreement between myself and Ccommerce Ecosystem Pvt. Ltd.
                                </span>
                            </label>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(3)} className="btn-secondary flex-1">Back</button>
                                <button
                                    onClick={submitForm}
                                    disabled={loading || !formData.termsAccepted}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Registration'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already registered? <Link href="/login" className="text-primary-600 hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
