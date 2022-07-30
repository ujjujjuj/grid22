import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import Products from "../components/Products";
import { useAuth } from "../hooks/auth";
import styles from "../styles/home.module.css";
import AddProduct from "./AddProducts";
import { useNavigate } from "react-router";

import Navbar from "./Navbar";
import Warranty from "./Warranty";
import contractAddress from "../data/localhost.json";

const Admin = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const getDivToRender = (state) => {
        if (state === 0) return <AddProduct />;
        if (state === 1) return <Products resale={false} />;
        if (state === 2) return <Warranty />;
    };

    useEffect(() => {
        if ((user.address !== contractAddress.owner)) navigate("/");
    }, [user]);

    const [menuState, setMenuState] = useState(0);
    return (
        <>
            <section className={styles.homeWrap}>
                <div className={styles.leftWrap}>
                    <div className={styles.headerLogo}>
                        <img src="/assets/images/flipkart-logo.png" width={30} alt={"Flipkart Logo"} />
                        <p>FlipkartGrid'22</p>
                    </div>
                    <div className={styles.menuWrap}>
                        <div
                            className={styles.menuItem}
                            onClick={() => {
                                if (menuState !== 0) setMenuState(0);
                            }}
                        >
                            <div className={styles.menuIcon}>
                                <i className="fa-solid fa-shop"></i>
                            </div>
                            <p>Add Products</p>
                        </div>
                        <div
                            className={styles.menuItem}
                            onClick={() => {
                                if (menuState !== 1) setMenuState(1);
                            }}
                        >
                            <div className={styles.menuIcon}>
                                <i className="fa-solid fa-rectangle-list"></i>
                            </div>
                            <p>All Products</p>
                        </div>
                        <div
                            className={styles.menuItem}
                            onClick={() => {
                                if (menuState !== 2) setMenuState(2);
                            }}
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            <p>Add Warranty</p>
                        </div>
                    </div>
                </div>
                <div className={styles.rightWrap}>
                    <Navbar />
                    {getDivToRender(menuState)}
                </div>
            </section>
        </>
    );
};

export default Admin;
