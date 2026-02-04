'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Smartphone, FileText, CheckCircle, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function NewSalePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1); // 1: Customer, 2: Device, 3: Review

    const [imgPreview, setImgPreview] = useState(null);

    const [formData, setFormData] = useState({
        // Customer
        customerMobile: '',
        customerName: '',
        customerEmail: '',
        street: '',
        city: '',
        state: '',
        pinCode: '',

        // Device
        deviceType: 'Mobile',
        deviceBrand: '',
        deviceModel: '',
        deviceInvoiceNumber: '',
        deviceInvoiceDate: '',
        purchasePrice: '',

        // Plan
        serviceType: 'ESS', // Default
    });

    const [calculations, setCalculations] = useState(null);

    const calculatePlan = () => {
        const price = parseFloat(formData.purchasePrice);
        if (!price) return;

        const CATEGORIES = {
            'Mobile': 8, 'Laptop': 8,
            'TV': 15, 'Washing Machine': 15, 'Dishwasher': 15,
            'Refrigerator': 20, 'AC': 20
        };
        const percentage = CATEGORIES[formData.deviceType] || 8;
        const cost = Math.round(price * (percentage / 100));

        setCalculations({
            planCost: cost,
            percentage
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/partners/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    customerAddress: {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        pinCode: formData.pinCode
                    }
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('Sale registered successfully!');
                setTimeout(() => router.push('/dashboard/sales'), 2000);
            } else {
                setError(data.error || 'Failed to register sale');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/sales" className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Sale</h1>
                    <p className="text-gray-500">Register a new service plan sale</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Steps */}
                <div className="flex border-b bg-gray-50">
                    <button
                        onClick={() => setStep(1)}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${step === 1 ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-500'}`}
                    >
                        <User className="w-4 h-4" /> Customer Details
                    </button>
                    <button
                        onClick={() => { if (formData.customerMobile) setStep(2); }}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${step === 2 ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-500'}`}
                    >
                        <Smartphone className="w-4 h-4" /> Device & Plan
                    </button>
                    <button
                        onClick={() => { if (formData.purchasePrice) { calculatePlan(); setStep(3); } }}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${step === 3 ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-500'}`}
                    >
                        <CheckCircle className="w-4 h-4" /> Review & Submit
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Customer */}
                        <div className={step === 1 ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Information</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Mobile Number *</label>
                                    <input
                                        type="tel" required
                                        className="input-field"
                                        placeholder="10-digit mobile number"
                                        value={formData.customerMobile}
                                        onChange={e => setFormData({ ...formData, customerMobile: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Customer Name *</label>
                                    <input
                                        type="text" required
                                        className="input-field"
                                        placeholder="Full Name"
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Email Address *</label>
                                    <input
                                        type="email" required
                                        className="input-field"
                                        placeholder="email@example.com"
                                        value={formData.customerEmail}
                                        onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="font-medium text-gray-700 mb-2 mt-2">Address</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text" required
                                            className="input-field"
                                            placeholder="Street/Locality"
                                            value={formData.street}
                                            onChange={e => setFormData({ ...formData, street: e.target.value })}
                                        />
                                        <input
                                            type="text" required
                                            className="input-field"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                        <input
                                            type="text" required
                                            className="input-field"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        />
                                        <input
                                            type="text" required
                                            className="input-field"
                                            placeholder="Pin Code"
                                            value={formData.pinCode}
                                            onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button type="button" onClick={() => setStep(2)} className="btn-primary">
                                    Next: Device Details
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Device */}
                        <div className={step === 2 ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Device & Invoice Details</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Device Type *</label>
                                    <select
                                        className="input-field"
                                        value={formData.deviceType}
                                        onChange={e => setFormData({ ...formData, deviceType: e.target.value })}
                                    >
                                        <option value="Mobile">Mobile Phone</option>
                                        <option value="Laptop">Laptop</option>
                                        <option value="TV">LED/Smart TV</option>
                                        <option value="Washing Machine">Washing Machine</option>
                                        <option value="Refrigerator">Refrigerator</option>
                                        <option value="AC">Air Conditioner</option>
                                        <option value="Dishwasher">Dishwasher</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Brand *</label>
                                    <input
                                        type="text" required
                                        className="input-field"
                                        placeholder="e.g. Samsung, Apple, LG"
                                        value={formData.deviceBrand}
                                        onChange={e => setFormData({ ...formData, deviceBrand: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Model *</label>
                                    <input
                                        type="text" required
                                        className="input-field"
                                        placeholder="e.g. Galaxy S24, iPhone 15"
                                        value={formData.deviceModel}
                                        onChange={e => setFormData({ ...formData, deviceModel: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Invoice Value (₹) *</label>
                                    <input
                                        type="number" required
                                        className="input-field"
                                        placeholder="0.00"
                                        value={formData.purchasePrice}
                                        onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Invoice Number *</label>
                                    <input
                                        type="text" required
                                        className="input-field"
                                        placeholder="INV-12345"
                                        value={formData.deviceInvoiceNumber}
                                        onChange={e => setFormData({ ...formData, deviceInvoiceNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Invoice Date *</label>
                                    <input
                                        type="date" required
                                        className="input-field"
                                        value={formData.deviceInvoiceDate}
                                        onChange={e => setFormData({ ...formData, deviceInvoiceDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Select Protection Plan</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {['ESS', 'EPS', 'CDC'].map(type => (
                                        <div
                                            key={type}
                                            className={`border rounded-xl p-4 cursor-pointer transition-all ${formData.serviceType === type
                                                    ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                                                    : 'border-gray-200 hover:border-primary-300'
                                                }`}
                                            onClick={() => setFormData({ ...formData, serviceType: type })}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-gray-900">{type}</span>
                                                {formData.serviceType === type && <CheckCircle className="w-5 h-5 text-primary-600" />}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {type === 'ESS' ? 'Extended Service Support' :
                                                    type === 'EPS' ? 'Enhanced Protection Service' :
                                                        'Comprehensive Device Care'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                                    Back
                                </button>
                                <button type="button" onClick={() => { calculatePlan(); setStep(3); }} className="btn-primary">
                                    Next: Review & Pay
                                </button>
                            </div>
                        </div>

                        {/* Step 3: Review */}
                        <div className={step === 3 ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Review Sale Details</h3>

                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <div className="flex justify-between items-center border-b pb-4 mb-4">
                                    <span className="text-gray-600">Plan Cost ({calculations?.percentage}%)</span>
                                    <span className="text-2xl font-bold text-primary-700">₹{calculations?.planCost?.toLocaleString()}</span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <span className="text-gray-500 block">Customer</span>
                                        <span className="font-medium">{formData.customerName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Mobile</span>
                                        <span className="font-medium">{formData.customerMobile}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Device</span>
                                        <span className="font-medium">{formData.deviceBrand} {formData.deviceModel}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Invoice Value</span>
                                        <span className="font-medium">₹{parseInt(formData.purchasePrice).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Plan Type</span>
                                        <span className="badge badge-info">{formData.serviceType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg text-amber-800 text-sm mb-6">
                                <Calculator className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <p>By clicking "Complete Sale", you confirm that the device details match the invoice and the customer has agreed to the service terms.</p>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary px-8 py-3 text-lg shadow-lg shadow-primary-200"
                                >
                                    {loading ? 'Processing...' : 'Complete Sale'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
