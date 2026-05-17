import React from 'react';
import './Sourcing.css';

const Sourcing = () => {
    return (
        <div className="sourcing-page">
            <section className="sourcing-hero">
                <div className="container">
                    <h1>Sourcing <br />Service</h1>
                    <p>Can't find it? We will.</p>
                </div>
            </section>

            <section className="sourcing-content container">
                <div className="sourcing-grid">
                    <div className="sourcing-info">
                        <h2>The Hunt for the <br />Impossible.</h2>
                        <p>Looking for a specific year, color, or a rare limited edition? Our network spans across continents, from private collectors to high-end boutiques.</p>
                        
                        <div className="process">
                            <div className="step">
                                <h3>01. Submit Request</h3>
                                <p>Tell us exactly what you're looking for via the form.</p>
                            </div>
                            <div className="step">
                                <h3>02. The Global Search</h3>
                                <p>We tap into our network of trusted sources worldwide.</p>
                            </div>
                            <div className="step">
                                <h3>03. Quality Check</h3>
                                <p>Once found, the item goes through our rigorous authentication.</p>
                            </div>
                        </div>
                    </div>

                    <div className="sourcing-form-container">
                        <h3>Start Your Search</h3>
                        <form className="sourcing-form">
                            <div className="form-group">
                                <label>What are you looking for?</label>
                                <input type="text" placeholder="e.g. Chanel 2.55 Flap Bag" />
                            </div>
                            <div className="form-group">
                                <label>Estimated Budget ($)</label>
                                <input type="text" placeholder="e.g. 5,000" />
                            </div>
                            <div className="form-group">
                                <label>Your Email</label>
                                <input type="email" placeholder="email@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Any specific details?</label>
                                <textarea placeholder="Year, color, material, etc."></textarea>
                            </div>
                            <button type="submit" className="premium-btn">Submit Request</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Sourcing;
