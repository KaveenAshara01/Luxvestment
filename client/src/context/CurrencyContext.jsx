import React, { createContext, useState, useEffect, useContext } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const SUPPORTED_CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'];

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('LKR');
    const [rates, setRates] = useState({ LKR: 1 }); // Default to 1:1 if fails
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch rates based on USD (or any stable base)
                const ratesRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const ratesData = await ratesRes.json();
                setRates(ratesData.rates);

                // Fetch user IP based currency
                const ipRes = await fetch('https://ipapi.co/json/');
                const ipData = await ipRes.json();
                
                let defaultCurrency = 'LKR'; // Default fallback
                if (ipData && ipData.currency) {
                    if (SUPPORTED_CURRENCIES.includes(ipData.currency)) {
                        defaultCurrency = ipData.currency;
                    } else if (ratesData.rates[ipData.currency]) {
                        // If it's a valid currency but not in our explicit supported list, 
                        // we can either add it to the supported list dynamically or fallback to USD
                        // Let's fallback to USD if not explicitly supported, or just use USD.
                        defaultCurrency = 'USD'; 
                    }
                }
                
                // If user has already selected a currency in localStorage, prefer that
                const storedCurrency = localStorage.getItem('selectedCurrency');
                if (storedCurrency && SUPPORTED_CURRENCIES.includes(storedCurrency)) {
                    setSelectedCurrency(storedCurrency);
                } else {
                    setSelectedCurrency(defaultCurrency);
                    localStorage.setItem('selectedCurrency', defaultCurrency);
                }

            } catch (err) {
                console.error('Error fetching currency data:', err);
                const storedCurrency = localStorage.getItem('selectedCurrency');
                if (storedCurrency) setSelectedCurrency(storedCurrency);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const changeCurrency = (currency) => {
        setSelectedCurrency(currency);
        localStorage.setItem('selectedCurrency', currency);
    };

    const convertPrice = (price, fromCurrency = 'LKR') => {
        if (!rates || !rates[fromCurrency] || !rates[selectedCurrency]) return price;
        // Convert to base USD first, then to selected
        const priceInUSD = price / rates[fromCurrency];
        const convertedPrice = priceInUSD * rates[selectedCurrency];
        return convertedPrice;
    };

    return (
        <CurrencyContext.Provider value={{ 
            selectedCurrency, 
            changeCurrency, 
            supportedCurrencies: SUPPORTED_CURRENCIES,
            convertPrice,
            loading 
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};
