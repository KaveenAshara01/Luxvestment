import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import './ProductCard.css';

const ProductCard = ({ product, variant = 'short', showBrand = false }) => {
    const isSoldOut = product.stock <= 0;
    const { convertPrice, selectedCurrency } = useCurrency();
    const productCurrency = product.currency || 'LKR';
    const displayPrice = convertPrice(product.price, productCurrency);

    const formatCurrencyPrefix = (curr) => {
        if (curr === 'LKR') return 'Rs ';
        if (curr === 'USD') return '$';
        if (curr === 'EUR') return '€';
        if (curr === 'GBP') return '£';
        return curr + ' ';
    };

    return (
        <Link to={`/product/${product._id}`} className={`product-card-link ${variant}`}>
            <div className={`product-card-v2 ${variant}`}>
                <div className={`card-image-wrapper ${variant}`}>
                    <img src={product.images[0]?.url} alt={product.name} />
                    {isSoldOut && <div className="sold-out-badge">Sold out</div>}
                </div>
                <div className={`card-content-v2 ${variant}`}>
                    <h3 className="card-title">{product.name}</h3>
                    {showBrand && <span className="card-brand">{product.brand || 'COACH'}</span>}
                    <p className="card-price">
                        {formatCurrencyPrefix(selectedCurrency)}
                        {displayPrice ? displayPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'} {selectedCurrency}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
