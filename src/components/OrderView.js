import styles from "../styles/productview.module.css";
import { useEffect, useState } from "react";

const OrderView = ({ order, select, resale, isResale = true }) => {
    const [plusBalance, setPlusBalance] = useState(10);
    const [isPopVisible, setPopVisible] = useState(false)
    const [resalePrice, setResalePrice] = useState("")
    const [owners, setOwners] = useState([
        {
            addr: "efewf3r43esg43gs",
            date: "22 July 2022"
        }])
    const [warrantyHistory, setWarrantyHistory] = useState([
        {
            claimed: true,
            date: "22 July 2022",
            reason: "Theft",
            
        }
    ])

    const buyProduct = () => {
        setPopVisible(!isPopVisible)
        //write code to buy product
        //product buy successful -> add to user orders
    };

    const goBack = () => {
        select({});
    };

    useEffect(() => {
        console.log(order)
    }, [])

    return (
        <>
            <section className={styles.prodViewWrap}>
                {isPopVisible ? (
                    <><div className={styles.overlay} onClick={() => {
                        setPopVisible(false)
                    }}></div>
                        <div className={styles.popUp} >
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
                        </div></>) : <></>}
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
                    <h3>Product Details</h3>
                    <ul>
                        {order.features.map((x, n) => {
                            return <li key={n}>{x}</li>;
                        })}
                    </ul>
                    <div className={styles.warrantyWrap}>
                        <div className={styles.resaleInfo}>
                            <div>
                                <h3>Warranty Ends On</h3>
                                <p>23 June 2022</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.resaleInfo}>
                        <div>
                            <h3>Ownership Info</h3>
                            {/* <a href="https://polygonscan.com" target={"_blank"} rel="noreferrer">View</a> */}
                            <ul>
                                {owners.map((x, n) => {
                                    return <li key={n}>{x.addr}<br /><small>Purchased on: {x.date}</small></li>;
                                })}
                            </ul>
                        </div>

                    </div>
                    {
                        warrantyHistory.length ?
                            <>
                                <div className={styles.resaleInfo} style={{marginTop:2}}>
                                    <div>
                                        <h3>Warranty History</h3>
                                        <ul className={styles.warrantyList}>
                                            {warrantyHistory.map((x, n) => {
                                                return (
                                                <li key={n}>
                                                   Claimed: <span>{x.claimed?"Yes":"No"}</span>
                                                   &nbsp;&nbsp;
                                                   Date: <span>{x.date}</span>
                                                   &nbsp;&nbsp;
                                                   Reason: <span>{x.reason}</span>
                                                </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </>
                            : <></>
                    }

                    <div className={`${styles.buyBtn} ${order.resale ? styles.disabled : ""}`} onClick={buyProduct}>
                        <i class="fas fa-coins"></i>&nbsp;&nbsp;List for Resale
                    </div>
                </div>

            </section>
        </>
    );
};

export default OrderView;
