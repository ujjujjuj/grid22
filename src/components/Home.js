import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/auth";
import styles from "../styles/home.module.css";
import MyAccount from "./Account";
import Navbar from "./Navbar";
import OrderHistory from "./Orders";
import Products from "./Products";
import contractAddress from "../data/polygontest.json";

const UserHome = () => {
    const { user, web3Data, connectMetamask } = useAuth();
    const navigate = useNavigate();
    const [menuState, setMenuState] = useState(0);

    useEffect(() => {
        if (!user.isLoggedIn) navigate("/login");
        if (!user.isMetamask) connectMetamask();
        if (user.address === contractAddress.owner) navigate("/admin");
    }, [user]);

    const getDivToRender = (state) => {
        if (state === 0) return <Products resale={false} />;
        if (state === 1) return <Products resale={true} />;
        if (state === 2) return <OrderHistory />;
    };

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
                            <p>Products</p>
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
                            <p>Resale Items</p>
                        </div>
                        <div
                            className={styles.menuItem}
                            onClick={() => {
                                if (menuState !== 2) setMenuState(2);
                            }}
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            <p>Order History</p>
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

export default UserHome;
