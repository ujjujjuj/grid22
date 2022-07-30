import styles from "../styles/Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import classnames from "classnames";
import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom'
import useWindowDimensions from "../hooks/windowDimensions";

const Navbar = () => {
    const { user, logoutUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const checkEnter = (e) => {
        if (e.key === "Enter") {
            setSearch("");
            // navigate(`/shop?q=${search}`);
        }
    };

    useEffect(()=>{
        console.log(user)
    },[user])

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
                        <i className="fas fa-search"></i>
                    </div>
                </div>
                <div className={styles.right}>
                    <div onClick={() => {
                        if (user.isLoggedIn) {
                            logoutUser()
                            navigate("/login")
                        } else {
                            navigate("/login")
                        }
                    }
                    }>
                        {user.isLoggedIn ? "Logout" : "Login"}
                    </div>
                </div>


            </nav>

        </>
    );
};

export default Navbar;
