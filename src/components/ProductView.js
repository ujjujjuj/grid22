import styles from "../styles/productview.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import { BigNumber } from "ethers";
import { ethers } from "ethers";

const ProductView = ({ product, select, resale }) => {
    const [plusBalance, setPlusBalance] = useState(10);
    const [isPopVisible, setPopVisible] = useState(false);
    const [usePlus, setUsePlus] = useState(false);
    const { web3Data, user } = useAuth();
    const buyProduct = () => {
        setPopVisible(!isPopVisible);
        //write code to buy product
        //product buy successful -> add to user orders
    };

    const goBack = () => {
        select({});
    };

    useEffect(() => {
        console.log(product);
        web3Data.contract.plusCoins(user.address).then((balance) => {
            balance = BigNumber.from(500);
            setPlusBalance(balance.toNumber());
        });
    }, []);

    const etherToPay = () => {
        if (usePlus) {
            const plusInWei = plusBalance * 1e12;
            const plusToPay = Math.min(plusInWei, ethers.utils.parseEther(product.price).toNumber());
            return [ethers.utils.formatEther(ethers.utils.parseEther(product.price).toNumber() - plusToPay), plusToPay];
        } else {
            return [product.price, 0];
        }
    };

    return (
        <>
            <section className={styles.prodViewWrap}>
                {isPopVisible ? (
                    <>
                        <div
                            className={styles.overlay}
                            onClick={() => {
                                setPopVisible(false);
                            }}
                        ></div>
                        <div className={styles.popUp}>
                            <h3>You are about to make a purchase of</h3>
                            <h1>{etherToPay()[0]} ETH</h1>
                            <small>
                                My Balance: <span>{plusBalance} PlusCoins</span>
                            </small>
                            <span className={plusBalance > 0 ? "" : styles.disabled}>
                                <input
                                    type="checkbox"
                                    name="plusCoin"
                                    id="plusCoin"
                                    checked={usePlus}
                                    onChange={() => setUsePlus((oldUsePlus) => !oldUsePlus)}
                                />
                                <label htmlFor="plusCoin">Use PlusCoins</label>
                            </span>
                            <div className={styles.buyBtn} onClick={buyProduct}>
                                <i className="fa-solid fa-bolt-lightning"></i>&nbsp;&nbsp;Confirm
                            </div>
                        </div>
                    </>
                ) : (
                    <></>
                )}
                <div className={styles.backIcon} onClick={goBack}>
                    <i className="fa-solid fa-arrow-left-long"></i>
                </div>
                <div className={styles.imageWrap}>
                    <div
                        className={styles.imgHolder}
                        style={{
                            backgroundImage: `url('${process.env.REACT_APP_SERVER_URL}/image/${product.image}')`,
                        }}
                    ></div>
                </div>
                <div className={styles.contentWrap}>
                    {resale ? (
                        <p>
                            <i className="fas fa-star"></i>&nbsp;&nbsp;<span>Listed for Resale</span>
                        </p>
                    ) : (
                        <></>
                    )}
                    <h1>{product.name}</h1>
                    <h2>{product.price} ETH</h2>
                    <h3>Product Details</h3>
                    <ul>
                        {product.features.map((x, n) => {
                            return <li key={n}>{x}</li>;
                        })}
                    </ul>
                    {resale ? (
                        <div className={styles.resaleInfo}>
                            <div>
                                <h3>Previous Owner</h3>
                                <p>Ujjwal Dimri</p>
                            </div>
                            <div>
                                <h3>Purchase Date</h3>
                                <p>22 Jul 2022</p>
                            </div>
                            <div>
                                <h3>Warranty Ends on</h3>
                                <p>20 May 2023</p>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className={styles.buyBtn} onClick={buyProduct}>
                        <i className="fa-solid fa-bolt-lightning"></i>&nbsp;&nbsp;BUY NOW
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductView;
