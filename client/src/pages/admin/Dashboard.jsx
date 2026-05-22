import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user ? user.token : '';
                
                const res = await fetch('/api/system/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to retrieve analytics data');
                }

                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <div className="bi-loading-container">
                <div className="luxury-spinner"></div>
                <p>Retrieving Business Intelligence Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bi-error-container">
                <h3>System Error</h3>
                <p>{error}</p>
            </div>
        );
    }

    // Prepare helper numbers
    const totalRevenue = stats?.totalRevenue || 0;
    const totalOrders = stats?.totalOrders || 0;
    const aov = stats?.averageOrderValue || 0;
    const convRate = stats?.conversionRate || 0;
    const totalVisits = stats?.totalVisits || 0;
    const uniqueVisitors = stats?.uniqueVisitors || 0;

    // Calculate maximum order counts for trend scaling
    const maxDayOrders = Math.max(...(stats?.orderTrendsByDay?.map(d => d.orders) || [1]), 1);

    return (
        <div className="bi-dashboard">
            <div className="bi-header">
                <h2>Business Intelligence</h2>
                <p className="subtitle">Real-time metrics, product performance, and visitor analytics</p>
            </div>

            {/* Metrics Overview Grid */}
            <div className="bi-metrics-grid">
                <div className="bi-metric-card">
                    <span className="metric-label">Total Revenue</span>
                    <h3 className="metric-value gold-text">
                        Rs {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <div className="metric-sub">Gross Sales Revenue</div>
                </div>

                <div className="bi-metric-card">
                    <span className="metric-label">Sales Volume</span>
                    <h3 className="metric-value">{totalOrders}</h3>
                    <div className="metric-sub">Successful checkouts</div>
                </div>

                <div className="bi-metric-card">
                    <span className="metric-label">Average Order Value (AOV)</span>
                    <h3 className="metric-value">
                        Rs {aov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <div className="metric-sub">Average ticket size</div>
                </div>

                <div className="bi-metric-card">
                    <span className="metric-label">Conversion Rate</span>
                    <h3 className="metric-value">{convRate.toFixed(2)}%</h3>
                    <div className="metric-sub">Unique Visitors to Orders</div>
                </div>
            </div>

            {/* Traffic overview widgets */}
            <div className="bi-traffic-overview">
                <div className="traffic-widget">
                    <span className="widget-label">Total Page Views</span>
                    <span className="widget-number">{totalVisits.toLocaleString()}</span>
                </div>
                <div className="traffic-divider"></div>
                <div className="traffic-widget">
                    <span className="widget-label">Unique Visitors</span>
                    <span className="widget-number">{uniqueVisitors.toLocaleString()}</span>
                </div>
            </div>

            {/* Secondary Grid for Weekly trends and Country Demographics */}
            <div className="bi-secondary-grid">
                {/* 1. Most Ordering Day of Week (Weekly Trend Bar Chart) */}
                <div className="bi-panel chart-panel">
                    <h3>Weekly Ordering Trends</h3>
                    <p className="panel-sub">Volume of completed checkouts per weekday</p>
                    
                    <div className="bar-chart-container">
                        {stats?.orderTrendsByDay?.map((d, index) => {
                            const percent = (d.orders / maxDayOrders) * 100;
                            return (
                                <div key={index} className="chart-bar-group">
                                    <div className="chart-bar-wrapper">
                                        <div 
                                            className="chart-bar" 
                                            style={{ height: `${Math.max(percent, 4)}%` }}
                                            title={`${d.orders} orders`}
                                        >
                                            {d.orders > 0 && <span className="bar-count-tag">{d.orders}</span>}
                                        </div>
                                    </div>
                                    <span className="chart-bar-label">{d.day.substring(0, 3)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Visitors Classified by Country */}
                <div className="bi-panel country-panel">
                    <h3>Global Audience Demographics</h3>
                    <p className="panel-sub">Visitor distribution by country</p>
                    
                    <div className="country-list">
                        {stats?.countryBreakdown?.length === 0 ? (
                            <p className="empty-state-text">No geographic visitor data recorded yet.</p>
                        ) : (
                            stats?.countryBreakdown?.map((item, index) => {
                                const visitPct = totalVisits > 0 ? ((item.count / totalVisits) * 100) : 0;
                                return (
                                    <div key={index} className="country-item">
                                        <div className="country-details">
                                            <span className="country-name">{item._id === 'Unknown' ? '📍 Global / Unknown' : item._id}</span>
                                            <span className="country-count">{item.count.toLocaleString()} views</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div 
                                                className="progress-bar-fill" 
                                                style={{ width: `${visitPct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Product Rankings Leaderboards */}
            <div className="bi-leaderboards-grid">
                {/* 1. Most Looking Product Ranking */}
                <div className="bi-panel ranking-panel">
                    <h3>Most Viewed Products</h3>
                    <p className="panel-sub">Catalog items with the highest traffic volumes</p>
                    
                    <div className="ranking-list">
                        {stats?.mostViewed?.length === 0 ? (
                            <p className="empty-state-text">No product page views recorded yet.</p>
                        ) : (
                            stats?.mostViewed?.map((item, idx) => (
                                <div key={item._id} className="ranking-item">
                                    <div className="rank-badge">{idx + 1}</div>
                                    {item.product?.images?.[0]?.url && (
                                        <img 
                                            src={item.product.images[0].url} 
                                            alt={item.product.name} 
                                            className="rank-thumb"
                                        />
                                    )}
                                    <div className="rank-info">
                                        <span className="rank-name">{item.product?.name || 'Deleted Product'}</span>
                                        <span className="rank-meta">
                                            Rs {item.product?.price?.toLocaleString()} • {item.product?.currency || 'LKR'}
                                        </span>
                                    </div>
                                    <div className="rank-score">
                                        <span className="score-num">{item.views}</span>
                                        <span className="score-lbl">views</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Most Ordered Products Ranking */}
                <div className="bi-panel ranking-panel">
                    <h3>Top-Selling Products</h3>
                    <p className="panel-sub">Catalog items ordered most frequently</p>
                    
                    <div className="ranking-list">
                        {stats?.mostOrdered?.length === 0 ? (
                            <p className="empty-state-text">No product orders registered yet.</p>
                        ) : (
                            stats?.mostOrdered?.map((item, idx) => (
                                <div key={item._id} className="ranking-item">
                                    <div className="rank-badge gold">{idx + 1}</div>
                                    {item.product?.images?.[0]?.url && (
                                        <img 
                                            src={item.product.images[0].url} 
                                            alt={item.product.name} 
                                            className="rank-thumb"
                                        />
                                    )}
                                    <div className="rank-info">
                                        <span className="rank-name">{item.product?.name || 'Deleted Product'}</span>
                                        <span className="rank-meta">
                                            Rs {item.product?.price?.toLocaleString()} • {item.product?.currency || 'LKR'}
                                        </span>
                                    </div>
                                    <div className="rank-score">
                                        <span className="score-num count-text">{item.count}</span>
                                        <span className="score-lbl">sold</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
