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
        <div className="home page-entrance">
            {/* Hero Grid */}
            <section className="hero-exact animate-fade-in">
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

            {/* Trust Badges Banner */}
            <section className="luxury-trust-banner container">
                <div className="trust-grid">
                    <div className="trust-card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <div className="trust-info">
                            <h4>AUTHENTICITY GUARANTEED</h4>
                            <p>Double lifetime warranty on all designer goods</p>
                        </div>
                    </div>
                    <div className="trust-card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                        <div className="trust-info">
                            <h4>DHL INSURED SHIPPING</h4>
                            <p>Insured express carbon-neutral tracked delivery</p>
                        </div>
                    </div>
                    <div className="trust-card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <div className="trust-info">
                            <h4>HAND-CURATED DROPS</h4>
                            <p>Individually appraised, vintage luxury classics</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Section 1 */}
            <section className="featured container">
                <div className="section-header-luxury">
                    <span className="section-subtitle-gold">CURATED SELECTION</span>
                    <h2 className="edit-title-luxury">Small prices, big finds — shop the edit now.</h2>
                    <div className="luxury-divider"></div>
                </div>
                
                <div className="home-product-grid-luxury">
                    {Array.isArray(latestProducts) && latestProducts.map((product) => (
                        <div key={product._id} className="grid-item-container">
                            <ProductCard product={product} variant="short" showBrand={true} />
                        </div>
                    ))}
                </div>
                
                <div className="view-all-container-luxury">
                    <Link to="/shop" className="view-all-btn-luxury">
                        <span>Explore Full Drop</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Premium Category Grid */}
            <section className="premium-categories container">
                <div className="section-header-luxury text-center">
                    <span className="section-subtitle-gold">THE ARCHIVE</span>
                    <h2 className="edit-title-luxury">Curated By Category</h2>
                    <div className="luxury-divider center"></div>
                </div>

                <div className="categories-grid-luxury">
                    <Link to="/shop" className="category-luxury-card animate-hover-lift">
                        <div className="category-bg-img" style={{ backgroundImage: `url('/lifestyle1.png')` }}></div>
                        <div className="category-content-overlay">
                            <h3>BAG COLLECTIVES</h3>
                            <p>Timeless Vintage Shoulder & Handbags</p>
                            <span className="shop-category-link">VIEW BAGS</span>
                        </div>
                    </Link>

                    <Link to="/shop" className="category-luxury-card animate-hover-lift">
                        <div className="category-bg-img" style={{ backgroundImage: `url('/bags_grid.png')` }}></div>
                        <div className="category-content-overlay">
                            <h3>WALLETS & PURSES</h3>
                            <p>Exquisite Leather Crafts & Wallets</p>
                            <span className="shop-category-link">VIEW LEATHERS</span>
                        </div>
                    </Link>

                    <Link to="/shop" className="category-luxury-card animate-hover-lift">
                        <div className="category-bg-img" style={{ backgroundImage: `url('/lifestyle2.png')` }}></div>
                        <div className="category-content-overlay">
                            <h3>RETRO ACCESSORIES</h3>
                            <p>Vintage Sunglasses & Appointed Extras</p>
                            <span className="shop-category-link">VIEW ACCESSORIES</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Editorial Showcase / Magazine Story (Mission Statement replacement) */}
            <section className="editorial-story container">
                <div className="editorial-grid">
                    <div className="editorial-col-img">
                        <div className="editorial-img-frame">
                            <img src="/lifestyle1.png" alt="Editorial Lifestyle" className="editorial-img" />
                            <div className="editorial-gold-overlay"></div>
                        </div>
                        <div className="editorial-floating-stamp">
                            <span>EST. 2024</span>
                        </div>
                    </div>
                    
                    <div className="editorial-col-content">
                        <span className="editorial-sub">THE ESSENCE OF STYLE</span>
                        <h3>LUXURY CURATION, PRESERVED</h3>
                        <p className="editorial-quote">
                            "In an era of fleeting fast fashion, true style is preserved in character and heritage. We source pieces that carry an immortal narrative."
                        </p>
                        <p className="editorial-body">
                            Every handbag, wallet, and retrospective accessory at Luxvestment is hand-selected and rigorously verified. By preserving pre-loved designer collections, we promote sustainable circular fashion while offering access to unique luxury vintages that have stood the test of time.
                        </p>
                        <div className="editorial-signature">
                            <div className="signature-line"></div>
                            <span className="signature-name">Luxvestment Editorial Team</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hot Right Now Section */}
            <section className="hot-right-now-luxury container">
                <div className="section-header-luxury">
                    <span className="section-subtitle-gold">TRENDING SELECTION</span>
                    <h2 className="edit-title-luxury">Hot Right Now <span className="fire-icon">🔥</span></h2>
                    <div className="luxury-divider"></div>
                </div>

                <div className="home-product-grid-luxury staggered">
                    {Array.isArray(hotProducts) && hotProducts.map((product, index) => (
                        <div key={product._id} className={`grid-item-container item-stagger-${index}`}>
                            <ProductCard product={product} variant="tall" showBrand={true} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
