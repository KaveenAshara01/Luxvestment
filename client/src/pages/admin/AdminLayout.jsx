import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    const location = useLocation();

    return (
        <div className="admin-layout-page container">
            <div className="admin-sidebar">
                <h2>Admin Panel</h2>
                <nav>
                    <ul>
                        <li>
                            <Link to="/admin/inventory" className={location.pathname === '/admin/inventory' ? 'active' : ''}>Inventory</Link>
                        </li>
                        <li>
                            <Link to="/admin/collections" className={location.pathname === '/admin/collections' ? 'active' : ''}>Collections</Link>
                        </li>
                        <li>
                            <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}>Orders</Link>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
