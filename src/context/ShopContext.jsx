import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ShopContext = createContext({
    cart: [],
    wishlist: [],
    addToCart: () => { },
    removeFromCart: () => { },
    toggleWishlist: () => { },
    isInCart: () => false,
    isInWishlist: () => false,
    cartCount: 0,
});

export const ShopProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    // Load data when user changes
    useEffect(() => {
        if (user) {
            const storedCart = localStorage.getItem(`shop_cart_${user.id}`);
            const storedWishlist = localStorage.getItem(`shop_wishlist_${user.id}`);

            if (storedCart) setCart(JSON.parse(storedCart));
            else setCart([]);

            if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
            else setWishlist([]);
        } else {
            setCart([]);
            setWishlist([]);
        }
    }, [user]);

    // Save data when cart/wishlist changes
    useEffect(() => {
        if (user) {
            localSave(`shop_cart_${user.id}`, cart);
        }
    }, [cart, user]);

    useEffect(() => {
        if (user) {
            localSave(`shop_wishlist_${user.id}`, wishlist);
        }
    }, [wishlist, user]);

    const localSave = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    const addToCart = (item) => {
        if (!isInCart(item.id)) {
            setCart([...cart, { ...item, addedAt: new Date().toISOString() }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const toggleWishlist = (item) => {
        if (isInWishlist(item.id)) {
            setWishlist(wishlist.filter(w => w.id !== item.id));
        } else {
            setWishlist([...wishlist, { ...item, addedAt: new Date().toISOString() }]);
        }
    };

    const isInCart = (itemId) => cart.some(item => item.id === itemId);
    const isInWishlist = (itemId) => wishlist.some(item => item.id === itemId);

    return (
        <ShopContext.Provider value={{
            cart,
            wishlist,
            addToCart,
            removeFromCart,
            toggleWishlist,
            isInCart,
            isInWishlist,
            cartCount: cart.length
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => useContext(ShopContext);
