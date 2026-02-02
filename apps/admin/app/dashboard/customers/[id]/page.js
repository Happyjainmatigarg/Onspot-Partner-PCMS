'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, User, Phone, MapPin, Smartphone, IndianRupee, Calendar } from 'lucide-react';

export default function CustomerDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const customerId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    // Approval form
    const [salesInvoice, setSalesInvoice] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // Rejection form
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectDetails, setRejectDetails] = useState('');

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const fetchCustomer = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`/api/admin/customers/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok) {
                setData(json);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!salesInvoice || !startDate) {
            alert('Please enter sales invoice number and start date');
            return;
        }

        setApproving(true);
        const token = localStorage.getItem('adminToken');

        try {
            const res = await fetch(`/api/admin/customers/${customerId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    salesInvoiceNumber: salesInvoice,
                    serviceStartDate: startDate,
                    notes
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            alert('Customer approved successfully!');
            router.push('/dashboard');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason) {
            alert('Please select a rejection reason');
            return;
        }

        setRejecting(true);
        const token = localStorage.getItem('adminToken');

        try {
            const res = await fetch(`/api/admin/customers/${customerId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    reason: rejectReason,
                    details: rejectDetails
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            alert('Customer rejected');
            router.push('/dashboard');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setRejecting(false);
            setShowRejectModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data || !data.customer) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Customer not found</p>
                <button onClick={() => router.back()} className="btn-secondary mt-4">
                    Go Back
                </button>
            </div>
        );
    }

    const { customer, partner, product, service, commissionPreview } = data;
    const isPending = customer.status === 'PENDING';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Customer Review</h1>
                        <p className="text-gray-500">{customerId}</p>
                    </div>
                </div>
                <span className={`badge ${customer.status === 'PENDING' ? 'badge-warning' :
                        customer.status === 'APPROVED' || customer.status === 'ACTIVE' ? 'badge-success' :
                            'badge-danger'
                    }`}>
                    {customer.status}
                </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="card">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        Customer Details
                    </h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Name</dt>
                            <dd className="font-medium">{customer.customerName}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Mobile</dt>
                            <dd className="font-medium">{customer.mobile}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Email</dt>
                            <dd className="font-medium">{customer.email}</dd>
                        </div>
                        <div className="pt-2 border-t">
                            <dt className="text-gray-500 mb-1">Address</dt>
                            <dd className="text-sm">
                                {customer.address?.street}<br />
                                {customer.address?.city}, {customer.address?.state} - {customer.address?.pinCode}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Partner Info */}
                <div className="card">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        Partner Details
                    </h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Partner ID</dt>
                            <dd className="font-mono text-sm">{partner?.partnerId}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Name</dt>
                            <dd className="font-medium">{partner?.applicantName}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Type</dt>
                            <dd><span className="badge badge-info">{partner?.partnerType}</span></dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">City</dt>
                            <dd>{partner?.billingAddress?.city}</dd>
                        </div>
                    </dl>
                </div>

                {/* Product Info */}
                <div className="card">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        Device Details
                    </h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Type</dt>
                            <dd><span className="badge badge-gray">{product?.productType}</span></dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Brand</dt>
                            <dd className="font-medium">{product?.brand}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Model</dt>
                            <dd className="font-medium">{product?.model}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Serial/IMEI</dt>
                            <dd className="font-mono text-sm">{product?.serialNumber}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Purchase Value</dt>
                            <dd className="font-bold text-green-600">₹{(product?.purchaseValue || 0).toLocaleString('en-IN')}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Purchase Date</dt>
                            <dd>{new Date(product?.purchaseDate).toLocaleDateString('en-IN')}</dd>
                        </div>
                    </dl>
                </div>

                {/* Service & Commission */}
                <div className="card">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-gray-400" />
                        Service & Commission
                    </h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Service Type</dt>
                            <dd><span className="badge badge-info text-lg">{service?.serviceType}</span></dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-500">Service Cost</dt>
                            <dd className="font-bold text-xl">₹{(service?.serviceCost || 0).toLocaleString('en-IN')}</dd>
                        </div>

                        {commissionPreview && (
                            <>
                                <hr />
                                <p className="text-sm font-medium text-gray-700">Commission Preview:</p>
                                <div className="flex justify-between text-sm">
                                    <dt className="text-gray-500">Rate ({partner?.partnerType})</dt>
                                    <dd>{commissionPreview.commissionPercentage}%</dd>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <dt className="text-gray-500">Before GST</dt>
                                    <dd>₹{commissionPreview.commissionBeforeGST?.toLocaleString('en-IN')}</dd>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <dt className="text-gray-500">GST (18%)</dt>
                                    <dd className="text-red-500">-₹{commissionPreview.gstAmount?.toLocaleString('en-IN')}</dd>
                                </div>
                                <div className="flex justify-between font-bold text-green-600">
                                    <dt>After GST</dt>
                                    <dd>₹{commissionPreview.commissionAfterGST?.toLocaleString('en-IN')}</dd>
                                </div>
                            </>
                        )}
                    </dl>
                </div>
            </div>

            {/* Approval Form */}
            {isPending && (
                <div className="card bg-yellow-50 border-yellow-200">
                    <h2 className="text-lg font-bold mb-4">Approval Action</h2>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sales Invoice Number *
                            </label>
                            <input
                                type="text"
                                value={salesInvoice}
                                onChange={(e) => setSalesInvoice(e.target.value)}
                                placeholder="INV-2024-XXXX"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Start Date *
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input-field"
                            rows={2}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleApprove}
                            disabled={approving}
                            className="btn-success flex-1 flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {approving ? 'Approving...' : 'Approve & Activate'}
                        </button>
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="btn-danger flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Reject Registration</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                            <select
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select reason</option>
                                <option value="INVALID_DEVICE">Invalid Device Information</option>
                                <option value="INVALID_INVOICE">Invalid Invoice/Receipt</option>
                                <option value="DUPLICATE">Duplicate Registration</option>
                                <option value="FRAUD">Suspected Fraud</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                            <textarea
                                value={rejectDetails}
                                onChange={(e) => setRejectDetails(e.target.value)}
                                className="input-field"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={rejecting}
                                className="btn-danger flex-1"
                            >
                                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
