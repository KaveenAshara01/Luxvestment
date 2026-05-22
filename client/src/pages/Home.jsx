import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    const [latestProducts, setLatestProducts] = useState([]);
    const [hotProducts, setHotProducts] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            const data = await fetchProducts();
            if (Array.isArray(data)) {
                // Keep the first section showing the first 4 products
                setLatestProducts(data.slice(0, 4));
                
                // Shuffle the entire catalog to display 4 random products in "Hot Right Now"
                const shuffled = [...data].sort(() => 0.5 - Math.random());
                setHotProducts(shuffled.slice(0, 4));
            } else {
                setLatestProducts([]);
                setHotProducts([]);
            }
        };
        loadProducts();
    }, []);

    return (
        <div className="home">
            {/* Hero Grid */}
            <section className="hero-exact">
                <div className="hero-exact-grid">
                    <div className="hero-col hero-col-left">
                        <img src="/human1.png" alt="Landed Vintage" />
                        <div className="hero-text-overlay">
                            <h1>LANDED</h1>
                            <p>VINTAGE LUXURY REIMAGINED</p>
                        </div>
                    </div>
                    <div className="hero-col hero-col-middle">
                        <img src="/bags_grid.png" alt="Bags Grid" />
                        <div className="hero-btn-overlay">
                            <Link to="/shop" className="pill-btn">Shop The Drop</Link>
                        </div>
                    </div>
                    <div className="hero-col hero-col-right">
                        <img src="/human2.png" alt="Lifestyle" />
                    </div>
                </div>
            </section>

            {/* Featured Section 1 */}
            <section className="featured container">
                <div className="section-header">
                    <h2 className="edit-title">Small prices, big finds — shop the edit now.</h2>
                </div>
                <div className="home-product-grid">
                    {Array.isArray(latestProducts) && latestProducts.map((product) => (
                        <ProductCard key={product._id} product={product} variant="short" showBrand={false} />
                    ))}
                </div>
                <div className="view-all-container">
                    <Link to="/shop" className="view-all-btn">View all</Link>
                </div>
            </section>

            {/* Mission Statement */}
            <section className="mission-statement container">
                <p>
                    <em>Authenticated, curated vintage designer bags, wallets, purses, and sunglasses<br/>—timeless pieces with true character.</em>
                </p>
            </section>

            {/* Hot Right Now Section */}
            <section className="hot-right-now container">
                <h2 className="hot-title">Hot Right Now 🌶️</h2>
                <div className="home-product-grid">
                    {Array.isArray(hotProducts) && hotProducts.map((product) => (
                        <ProductCard key={product._id} product={product} variant="tall" showBrand={false} />
                    ))}
                </div>
            </section>

        </div>
    );
};

export default Home;
