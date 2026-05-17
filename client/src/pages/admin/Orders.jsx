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
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order._id}>
                                        <td>{order._id.substring(order._id.length - 8)}</td>
                                        <td>
                                            {order.customerName}<br/>
                                            <small>{order.customerEmail}</small>
                                        </td>
                                        <td>Rs {order.totalAmount ? order.totalAmount.toLocaleString() : '0'}</td>
                                        <td>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
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
