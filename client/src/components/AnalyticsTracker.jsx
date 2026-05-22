import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackPageVisit = async () => {
            try {
                // Determine if it's a product details page
                let productId = null;
                const productPathRegex = /\/product\/([a-fA-F0-9]{24})/;
                const match = location.pathname.match(productPathRegex);
                if (match) {
                    productId = match[1];
                }

                // Call public GeoIP service to detect country on the client
                let detectedCountry = sessionStorage.getItem('user_country');
                if (!detectedCountry) {
                    try {
                        const geoRes = await fetch('https://ipapi.co/json/');
                        if (geoRes.ok) {
                            const geoData = await geoRes.json();
                            if (geoData.country_name) {
                                detectedCountry = geoData.country_name;
                                sessionStorage.setItem('user_country', detectedCountry);
                            }
                        }
                    } catch (geoErr) {
                        // Fall back to server-side header extraction
                    }
                }

                if (!detectedCountry) {
                    detectedCountry = 'Unknown';
                }

                // Send tracking request to server
                await fetch('/api/system/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: location.pathname,
                        productId,
                        country: detectedCountry
                    })
                });
            } catch (err) {
                // Fail silently in development/production to avoid interfering with UX
            }
        };

        trackPageVisit();
    }, [location.pathname]);

    return null;
};

export default AnalyticsTracker;
