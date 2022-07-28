import styles from "../styles/Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import classnames from "classnames";
import { useCart } from "../hooks/cart";
import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom'
import useWindowDimensions from "../hooks/windowDimensions";

const Navbar = () => {
    const { cart, toggleCart, getCartSize } = useCart();
    const { user } = useAuth();
    const location = useLocation();
    const [isNavExpanded, setNavExpanded] = useState(false)
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const { height, width } = useWindowDimensions();
    const checkEnter = (e) => {
        if (e.key === "Enter") {
            setSearch("");
            navigate(`/shop?q=${search}`);
        }
    };

    useEffect(() => {
    }, [cart]);


    return (
        <>
            <nav className={location.pathname.includes("login") ? styles.hide : styles.show}>
                <div className={styles.left}>
                <div className={classnames(styles.item, styles.navSearch)}>
                        <input
                            type={"text"}
                            placeholder="Search for products"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={checkEnter}
                        />
                       <i class="fas fa-search"></i>
                    </div>
                </div>
            
         
            </nav>

        </>
    );
};

export default Navbar;
