import React, { useState, useEffect } from 'react';
import './AdminSubPages.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const getAuthHeaders = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.token : '';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    const loadOrders = async () => {
        try {
            const res = await fetch('/api/orders', { headers: getAuthHeaders() });
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            loadOrders();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-subpage">
            <h2>Orders Management</h2>

            <div className="admin-list">
                <h3>Recent Orders</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer & Shipping</th>
                                <th>Items Ordered</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order._id}>
                                        <td>
                                            <strong>#{order._id.substring(order._id.length - 8)}</strong>
                                            <br />
                                            <span style={{fontSize: '0.7rem', color: '#666'}}>
                                                {order.userId ? 'Registered User' : 'Guest Checkout'}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{order.customerName}</strong> (<small>{order.customerEmail}</small>)
                                            <br />
                                            <span style={{fontSize: '0.8rem', color: '#555'}}>
                                                {order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.country}` : 'N/A'}
                                            </span>
                                            <br />
                                            <span style={{fontSize: '0.75rem', color: '#888'}}>Paid via {order.paymentMethod || 'Card'}</span>
                                        </td>
                                        <td>
                                            <div style={{maxHeight: '100px', overflowY: 'auto', fontSize: '0.85rem'}}>
                                                {order.products.map((p, idx) => (
                                                    <div key={idx} style={{marginBottom: '4px'}}>
                                                        • {p.product ? p.product.name : 'Item'} (x{p.quantity}) - Rs {p.price ? p.price.toLocaleString() : 0}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td><strong>Rs {order.totalAmount ? order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</strong></td>
                                        <td>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="status-dropdown"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Orders;
