import React from 'react';
import './Policies.css';

const Policies = () => {
    return (
        <div className="policies-page container">
            <h1>Our Policies</h1>
            <section className="policy-section">
                <h2>Shipping & Delivery</h2>
                <p>We ship worldwide using DHL Express and FedEx. All shipments are fully insured and require a signature upon delivery.</p>
                <p>Domestic (US) Shipping: 2-3 business days. <br /> International Shipping: 5-7 business days.</p>
            </section>
            <section className="policy-section">
                <h2>Returns & Exchanges</h2>
                <p>Due to the unique and vintage nature of our pieces, all sales are final. We provide detailed descriptions and high-resolution photos of every item, including any minor wear or imperfections. Please review all information carefully before purchasing.</p>
            </section>
            <section className="policy-section">
                <h2>Privacy Policy</h2>
                <p>Your privacy is paramount. We use industry-standard encryption to protect your data and will never share your information with third parties without your explicit consent.</p>
            </section>
        </div>
    );
};

export default Policies;
