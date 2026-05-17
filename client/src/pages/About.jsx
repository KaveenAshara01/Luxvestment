import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <h1>Who Are We? <br />(The Short Story)</h1>
                </div>
            </section>

            <section className="about-content container">
                <div className="about-grid">
                    <div className="about-image">
                        <img src="/lifestyle2.png" alt="Our Vibe" />
                    </div>
                    <div className="about-text">
                        <h2>The obsession started in 2018.</h2>
                        <p>What began as a personal hunt for the perfect vintage Kelly bag turned into a global mission to curate the world's most investment-worthy pieces.</p>
                        <p>At Luxvestment, we don't just sell bags; we sell heritage. We believe that a well-chosen vintage piece is more than an accessory—it's a store of value, a piece of art, and a sustainable choice for the modern wardrobe.</p>
                        <div className="stats-grid">
                            <div className="stat">
                                <h3>5000+</h3>
                                <p>Items Authenticated</p>
                            </div>
                            <div className="stat">
                                <h3>50+</h3>
                                <p>Global Sources</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="values container">
                <div className="value-card">
                    <span>01</span>
                    <h3>Quality over Everything</h3>
                    <p>We only source pieces in excellent to pristine condition. If it's not good enough for our personal collection, it's not good enough for yours.</p>
                </div>
                <div className="value-card">
                    <span>02</span>
                    <h3>Trust is Currency</h3>
                    <p>Authenticity is the heart of our business. Every stitch, stamp, and leather grain is inspected by our in-house experts.</p>
                </div>
                <div className="value-card">
                    <span>03</span>
                    <h3>The Hunt is On</h3>
                    <p>We thrive on the challenge of finding the "impossible" piece. If it exists, we'll find it for you.</p>
                </div>
            </section>
        </div>
    );
};

export default About;
