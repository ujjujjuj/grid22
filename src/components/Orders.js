import classNames from "classnames";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import styles from "../styles/shop.module.css";
import OrderView from "./OrderView";
import Product from "./Product";

const OrderHistory = () => {
    const [selectedProd, setSelectedProd] = useState({});
    const [orders, setOrders] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        setSelectedProd({});
        fetch(`${process.env.REACT_APP_SERVER_URL}/ownedItems/${user.address}`)
            .then((res) => res.json())
            .then((dat) => setOrders(dat));
    }, []);

    return (
        <>
            {selectedProd.name ? (
                <OrderView order={selectedProd} select={setSelectedProd} />
            ) : (
                <section className={classNames(styles.products, styles.shopPage)}>
                    {orders.length === 0 ? (
                        <>
                            <Product shimmer="true" />
                            <Product shimmer="true" />
                            <Product shimmer="true" />
                            <Product shimmer="true" />
                        </>
                    ) : (
                        orders.map((product) => (
                            <Product key={product._id} shimmer={false} selectHook={setSelectedProd} product={product} />
                        ))
                    )}
                </section>
            )}
        </>
    );
};

export default OrderHistory;
