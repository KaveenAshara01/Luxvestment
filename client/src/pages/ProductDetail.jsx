import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [openAccordion, setOpenAccordion] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { convertPrice, selectedCurrency } = useCurrency();
    const { addToCart } = useCart();

    useEffect(() => {
        const loadProductAndRelated = async () => {
            const data = await fetchProductById(id);
            setProduct(data);
            
            const allProducts = await fetchProducts();
            if (Array.isArray(allProducts)) {
                // Filter out current product and take up to 4
                const filtered = allProducts.filter(p => p._id !== id).slice(0, 4);
                setRelatedProducts(filtered);
            }
        };
        loadProductAndRelated();
    }, [id]);

    if (!product) return <div className="container" style={{paddingTop: '15rem'}}>Loading...</div>;

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const handleBuyNow = async () => {
        const success = await addToCart(product, quantity);
        if (success) {
            navigate('/checkout');
        }
    };

    return (
        <div className="product-detail container">
            <div className="detail-grid">
                {/* Image Gallery */}
                <div className="detail-images">
                    <div className="main-image">
                        <img src={product.images[activeImg]?.url} alt={product.name} />
                    </div>
                    <div className="thumbnail-grid">
                        {product.images.map((img, i) => (
                            <img 
                                key={i} 
                                src={img.url} 
                                alt="" 
                                className={activeImg === i ? 'active' : ''}
                                onClick={() => setActiveImg(i)}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="detail-info">
                    <h1 className="detail-title">{product.name}</h1>
                    <p className="detail-price">{selectedCurrency} {product.price ? convertPrice(product.price, product.currency || 'LKR').toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</p>
                    <p className="taxes-info">Taxes included. <span className="shipping-link">Shipping</span> calculated at checkout.</p>

                    {product.stock > 0 && product.stock < 3 && (
                        <div className="low-stock-alert">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>Only {product.stock} {product.stock === 1 ? 'item' : 'items'} left in stock - order soon</span>
                        </div>
                    )}

                    <div className="quantity-selector">
                        <label>Quantity</label>
                        <div className="qty-controls">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <input type="number" value={quantity} readOnly />
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                    </div>

                    <div className="detail-buttons-group">
                        <button className="add-to-cart-btn" onClick={() => addToCart(product, quantity)}>
                            Add to cart
                        </button>
                        <button className="buy-it-now-btn" onClick={handleBuyNow}>
                            Buy it now
                        </button>
                    </div>
                    <p className="payment-options">Secure credit & debit card checkout</p>

                    <div className="detail-description" dangerouslySetInnerHTML={{ __html: product.description }}>
                    </div>
                </div>
            </div>

            {/* Hot Right Now Section */}
            {relatedProducts.length > 0 && (
                <div className="related-products">
                    <h2 className="related-title">Hot Right Now</h2>
                    <div className="related-grid">
                        {relatedProducts.map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
