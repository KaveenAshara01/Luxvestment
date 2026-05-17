import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            const data = await fetchProducts();
            if (Array.isArray(data)) {
                setProducts(data.slice(0, 4));
            } else {
                setProducts([]);
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

            {/* Featured Section */}
            <section className="featured container">
                <div className="section-header">
                    <h2>Latest Curations</h2>
                </div>
                <div className="archive-grid">
                    {Array.isArray(products) && products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
                <div className="view-all-container">
                    <Link to="/shop" className="view-all-btn">View all</Link>
                </div>
            </section>


        </div>
    );
};

export default Home;
