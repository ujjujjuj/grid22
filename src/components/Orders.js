import classNames from "classnames";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import styles from "../styles/shop.module.css";
import OrderView from "./OrderView";
import Product from "./Product";

const OrderHistory = ({isAdmin}) => {
    const [selectedProd, setSelectedProd] = useState({});
    const [orders, setOrders] = useState([]);
    const { user } = useAuth();
    const [init,setInit] = useState(true);


    useEffect(() => {
        setSelectedProd({});
        fetch(`${process.env.REACT_APP_SERVER_URL}/ownedItems/${user.address}`)
            .then((res) => res.json())
            .then((dat) => {
                setOrders(dat)
                setInit(false)
            });
    }, []);

    return (      <>
        {selectedProd.name ? (
            <OrderView isAdmin ={isAdmin} order={selectedProd} select={setSelectedProd}/>
        ) : (
            <section className={classNames(styles.products, styles.shopPage)}>
                {orders.length === 0 && init? (
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
    </>)
};

export default OrderHistory;
