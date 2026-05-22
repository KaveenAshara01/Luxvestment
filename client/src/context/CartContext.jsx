import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
    fetchCartApi, 
    addToCartApi, 
    updateCartQtyApi, 
    removeFromCartApi, 
    clearCartApi, 
    syncCartApi,
    fetchProductById
} from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load cart on user change or mount
    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            if (user) {
                try {
                    // Check if guest cart exists in localStorage to sync
                    const localCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
                    if (localCart.length > 0) {
                        const synced = await syncCartApi(localCart.map(i => ({ product: i.product._id, quantity: i.quantity })));
                        setCartItems(synced.items || []);
                        localStorage.removeItem('guest_cart');
                    } else {
                        const data = await fetchCartApi();
                        setCartItems(data.items || []);
                    }
                } catch (err) {
                    console.error('Error loading cart:', err);
                }
            } else {
                const localCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
                setCartItems(localCart);
            }
            setLoading(false);
        };
        loadCart();
    }, [user]);

    const saveLocalCart = (items) => {
        setCartItems(items);
        localStorage.setItem('guest_cart', JSON.stringify(items));
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            // Verify stock
            const latestProd = await fetchProductById(product._id);
            if (!latestProd || latestProd.stock < quantity) {
                alert(`Cannot add to cart. Only ${latestProd ? latestProd.stock : 0} items available in stock.`);
                return false;
            }

            if (user) {
                const data = await addToCartApi(product._id, quantity);
                setCartItems(data.items || []);
            } else {
                let items = [...cartItems];
                const existingIndex = items.findIndex(i => i.product._id === product._id);
                if (existingIndex > -1) {
                    const newQty = items[existingIndex].quantity + quantity;
                    if (newQty > latestProd.stock) {
                        alert(`Cannot add more. Only ${latestProd.stock} available.`);
                        return false;
                    }
                    items[existingIndex].quantity = newQty;
                } else {
                    items.push({ product: latestProd, quantity });
                }
                saveLocalCart(items);
            }
            setIsCartOpen(true);
            return true;
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding to cart');
            return false;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return removeFromCart(productId);

        try {
            const latestProd = await fetchProductById(productId);
            if (!latestProd || latestProd.stock < quantity) {
                alert(`Only ${latestProd ? latestProd.stock : 0} available in stock.`);
                return;
            }

            if (user) {
                const data = await updateCartQtyApi(productId, quantity);
                setCartItems(data.items || []);
            } else {
                let items = [...cartItems];
                const index = items.findIndex(i => i.product._id === productId);
                if (index > -1) {
                    items[index].quantity = quantity;
                    saveLocalCart(items);
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating quantity');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            if (user) {
                const data = await removeFromCartApi(productId);
                setCartItems(data.items || []);
            } else {
                const items = cartItems.filter(i => i.product._id !== productId);
                saveLocalCart(items);
            }
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const clearCart = async () => {
        try {
            if (user) {
                await clearCartApi();
                setCartItems([]);
            } else {
                setCartItems([]);
                localStorage.removeItem('guest_cart');
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
        }
    };

    const getCartTotal = (convertPrice, currency) => {
        return cartItems.reduce((acc, item) => {
            const price = convertPrice ? convertPrice(item.product.price, item.product.currency || 'LKR') : item.product.price;
            return acc + (price * item.quantity);
        }, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            getCartTotal,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
