import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const isSoldOut = product.stock <= 0;
    const { convertPrice, selectedCurrency } = useCurrency();
    const productCurrency = product.currency || 'LKR';
    const displayPrice = convertPrice(product.price, productCurrency);

    return (
        <Link to={`/product/${product._id}`} className="product-card-link">
            <div className="product-card-v2">
                <div className="card-image-wrapper">
                    <img src={product.images[0]?.url} alt={product.name} />
                    {isSoldOut && <div className="sold-out-badge">Sold out</div>}
                </div>
                <div className="card-content-v2">
                    <h3 className="card-title">{product.name}</h3>
                    <p className="card-price">{selectedCurrency} {displayPrice ? displayPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</p>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
