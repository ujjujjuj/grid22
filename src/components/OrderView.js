import styles from "../styles/productview.module.css";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import { ethers } from "ethers";
import Warranty from "./Warranty";

const WarrantyReason = ["Wear and Tear", "Theft", "Water Damage"];
const WarrantyOutcome = ["Repair", "Replace"];

const OrderView = ({ order, select, resale, isResale = true, isAdmin = false }) => {
    const [plusBalance, setPlusBalance] = useState(10);
    const [isPopVisible, setPopVisible] = useState(false);
    const [resalePrice, setResalePrice] = useState("0.001");
    const { web3Data } = useAuth();
    const [owners, setOwners] = useState([]);
    const [warrantyHistory, setWarrantyHistory] = useState([]);

    const buyProduct = async () => {
        await web3Data.contract.putForResale(order.sno, ethers.utils.parseEther(resalePrice));
        fetch(`${process.env.REACT_APP_SERVER_URL}/putforresale`, {
            method: "POST",
            body: new URLSearchParams({ sno: order.sno, value: resalePrice }),
        });
        console.log(resalePrice);
        setPopVisible(!isPopVisible);
        //write code to buy product
        //product buy successful -> add to user orders
    };

    const goBack = () => {
        select({});
    };

    useEffect(() => {
        (async () => {
            const owners = await web3Data.contract.getItemOwners(order.sno);
            setOwners(owners);
            const itemInfo = await web3Data.contract.purchasedItems(order.sno);
            const timeLeft = Date.now() - (order.warranty * 30 * 24 * 60 * 60 + itemInfo[1].toNumber());
            const warrantyInfo = await web3Data.contract.getItemWarranty(order.sno);
            console.log(warrantyInfo);
            setWarrantyHistory(warrantyInfo);
        })();
        console.log(order);
    }, []);

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
                            <h3>Your are about to list your item for resale</h3>
                            <input
                                name="price"
                                placeholder="Price (ETH)"
                                required
                                value={resalePrice}
                                type="number"
                                step={"0.001"}
                                min={0}
                                onChange={(e) => setResalePrice(e.target.value)}
                                className={styles.priceInput}
                            />
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
                            backgroundImage: `url('${process.env.REACT_APP_SERVER_URL}/image/${order.image}')`,
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
                    <h1>{order.name}</h1>
                    <h2>{order.price} ETH</h2>
                    {order.isSoulbound ? <div className={styles.soulBound}>Soulbound</div> : <></>}

                    <h3>Product Details</h3>
                    <ul>
                        {order.features.map((x, n) => {
                            return <li key={n}>{x}</li>;
                        })}
                    </ul>
                    <div className={styles.warrantyWrap}>
                        <div className={styles.resaleInfo}>
                            <div>
                                <h3>Warranty</h3>
                                <p>{order.warranty} month(s)</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.resaleInfo}>
                        <div>
                            <h3>Ownership Info</h3>
                            {/* <a href="https://polygonscan.com" target={"_blank"} rel="noreferrer">View</a> */}
                            <ul>
                                {owners.map((x, n) => {
                                    return (
                                        <li key={n}>
                                            <pre style={{ display: "inline" }}>
                                                {x}
                                                {n === owners.length - 1 && " (you)"}
                                            </pre>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    {warrantyHistory.length ? (
                        <>
                            <div className={styles.resaleInfo} style={{ marginTop: 2 }}>
                                <div>
                                    <h3>Warranty History</h3>
                                    <ul className={styles.warrantyList}>
                                        {warrantyHistory.map((x, n) => {
                                            console.log(x);
                                            return (
                                                <li key={n}>
                                                    Date:{" "}
                                                    <span>
                                                        {new Date(x[2].toNumber() * 1000)
                                                            .toISOString()
                                                            .substring(0, 10)}
                                                    </span>
                                                    <br />
                                                    &nbsp;&nbsp;&nbsp; Reason: <span>{WarrantyReason[x[0]]}</span>
                                                    <br />
                                                    &nbsp;&nbsp;&nbsp; Outcome: <span>{WarrantyOutcome[x[1]]}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}

                    {isAdmin ? (
                        <></>
                    ) : (
                        <div
                            className={`${styles.buyBtn} ${order.resale || order.isSoulbound ? styles.disabled : ""}`}
                            onClick={() => {
                                setPopVisible(true);
                            }}
                        >
                            <i class="fas fa-coins"></i>&nbsp;&nbsp;List for Resale
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default OrderView;
