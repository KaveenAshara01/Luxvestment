import React from 'react';
import './Authenticity.css';

const Authenticity = () => {
    return (
        <div className="authenticity-page">
            <section className="auth-hero">
                <div className="container">
                    <h1>Real Recognize <br />Real.</h1>
                    <p>Our commitment to 100% authenticity.</p>
                </div>
            </section>

            <section className="auth-content container">
                <div className="auth-intro">
                    <h2>Fake isn't in our vocabulary.</h2>
                    <p>In a world of "super-fakes," trust is everything. At Luxvestment, every item we source goes through a rigorous multi-point inspection process before it ever reaches our shop.</p>
                </div>

                <div className="auth-features">
                    <div className="auth-card">
                        <h3>Expert Appraisal</h3>
                        <p>Our in-house team has decades of collective experience in luxury authentication. They know every stitch, serial number, and material characteristic of the brands we carry.</p>
                    </div>
                    <div className="auth-card">
                        <h3>AI Verification</h3>
                        <p>We combine human expertise with the latest AI-driven authentication technology to provide an extra layer of certainty.</p>
                    </div>
                    <div className="auth-card">
                        <h3>Money-Back Guarantee</h3>
                        <p>We are so confident in our process that we offer a lifetime authenticity guarantee. If any item is proven inauthentic by a reputable third-party, we will issue a full refund.</p>
                    </div>
                </div>

                <div className="auth-banner">
                    <div className="banner-text">
                        <h2>Every piece tells a story. We make sure it's the right one.</h2>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Authenticity;
