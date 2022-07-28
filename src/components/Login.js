import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/auth";
import styles from "../styles/auth.module.css";

const connect = async (setUser) => {
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });
    if (accounts.length > 0) {
        setUser(accounts[0]);
    }
};

export default function Login() {
    const { user, loginUser } = useAuth();
    const navigate = useNavigate();

    const setUser = (addr) => {
        loginUser(addr);
        navigate("/");
    };

    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    if (!window.ethereum) return alert("Please install the MetaMask extension to continue");

    return (
        <section className={styles.authSection}>
            <img src="/assets/images/flipkart-logo.png" className={styles.flipLogo} alt="Flipkart Logo" />
            <div className={styles.metaWrap}>
                <img src="/assets/images/meta-logo.svg.png" width={100} alt="MetaMask Logo" />
                <div className={styles.button} onClick={() => connect(setUser)}>
                    Connect to MetaMask
                </div>
            </div>
        </section>
    );
}
