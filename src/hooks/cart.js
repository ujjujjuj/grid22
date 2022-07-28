import { useState, useContext, createContext, useEffect } from "react";

export const CartContext = createContext([]);

export const CartProvider = ({ children }) => {
    return <CartContext.Provider value={useProvideCart()}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);

export const useProvideCart = () => {
    const [cart, setCart] = useState({
        isExpanded: false,
        items: {},
    });

    const toggleCart = () => {
        setCart({ ...cart, isExpanded: !cart.isExpanded });
    };

    const setCartItem = (product, amount) => {
        let quantity = (cart.items[product.id]?.quantity || 0) + amount;
        if (quantity === 0) {
            setCart((cart) => {
                let newCart = Object.assign({}, cart);
                delete newCart.items[product.id];
                return newCart;
            });
        } else {
            setCart((cart) => {
                let newCart = Object.assign({}, cart);
                newCart.items[product.id] = { ...product, quantity };
                return newCart;
            });
        }
    };

    const deleteCartItem = (id) => {
        setCart((cart) => {
            let newCart = Object.assign({}, cart);
            delete newCart.items[id];
            return newCart;
        });
    };

    const emptyCart = ()=>{
        setCart((cart)=>{
            let newCart = Object.assign({}, cart);
            newCart.items={}
            return newCart
        })
    }

    const getCheckoutCart = () => {
        let checkoutCart = {};
        Object.entries(cart.items).forEach(([productId, product]) => {
            checkoutCart[productId] = product.quantity;
        });
        return checkoutCart;
    };

    const getCartSize = ()=>{
        let n=0;
        Object.entries(cart.items).forEach((x)=>{
            n= n+x[1].quantity;
        })
        return n;
    }

    useEffect(() => {
        let storedCart = localStorage.getItem("cart");
        if (storedCart && storedCart.length > 0) {
            let jsonCart = JSON.parse(storedCart);
            jsonCart.isExpanded = false;
            setCart(jsonCart);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log(cart)
    }, [cart]);

    return { cart, toggleCart, setCartItem, deleteCartItem, getCheckoutCart ,getCartSize,emptyCart};
};
