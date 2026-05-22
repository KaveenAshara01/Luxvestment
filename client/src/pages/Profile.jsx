import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrdersApi } from '../utils/api';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchMyOrdersApi();
                setOrders(data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
            setLoading(false);
        };
        loadOrders();
    }, []);

    if (!user) return <div className="container" style={{paddingTop: '15rem'}}>Please log in to view your profile.</div>;

    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-processing';
        }
    };

    return (
        <div className="profile-page container">
            <div className="profile-header">
                <div>
                    <h1>Account Overview</h1>
                    <p className="user-email">Welcome back, {user.name} ({user.email})</p>
                </div>
                <button onClick={logout} className="pill-btn logout-pill">Logout Account</button>
            </div>

            <div className="orders-section">
                <h2>Your Orders ({orders.length})</h2>
                {loading ? (
                    <p>Loading your order history...</p>
                ) : orders.length === 0 ? (
                    <div className="empty-orders">
                        <p>You haven't placed any orders yet.</p>
                        <Link to="/shop" className="pill-btn">Discover Vintage Pieces</Link>
                    </div>
                ) : (
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Fulfillment Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td className="order-id-col">
                                            #{order._id.substring(order._id.length - 8)}
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td className="order-items-col">
                                            {order.products.map(p => p.product ? `${p.product.name} (x${p.quantity})` : 'Vintage item').join(', ')}
                                        </td>
                                        <td className="order-total-col">
                                            Rs {order.totalAmount ? order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {order.status || 'Processing'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
