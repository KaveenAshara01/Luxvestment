import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const loadProducts = async () => {
            const data = await fetchProducts();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        };
        loadProducts();
    }, []);

    const filteredProducts = (Array.isArray(products) && filter === 'All')
        ? products 
        : (Array.isArray(products) ? products.filter(p => p.collectionId && p.collectionId.name === filter) : []);

    const categories = ['All', ...new Set(Array.isArray(products) ? products.map(p => p.collectionId?.name).filter(Boolean) : [])];

    return (
        <div className="shop-page container page-entrance">
            <div className="shop-header">
                <h1>The Archive</h1>
                <p>Authentic, rare, and ready for a new home.</p>
            </div>

            <div className="shop-layout">
                <aside className="filters">
                    <h3>Collections</h3>
                    <ul>
                        {categories.map(cat => (
                            <li 
                                key={cat} 
                                className={filter === cat ? 'active' : ''}
                                onClick={() => setFilter(cat)}
                            >
                                {cat}
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="product-archive">
                    <div className="archive-grid">
                        {filteredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Shop;
