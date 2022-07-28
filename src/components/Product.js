import styles from "../styles/product.module.css";
import { useNavigate } from "react-router-dom";

import classNames from "classnames";

const Product = ({ product = { name: "Example Product", price: 42000, image: "" , isSoulbound:false, features:[]}, shimmer = false,selectHook,resale }) => {
    const navigate = useNavigate();
    const openProduct = () => {
        selectHook(product)
    }
    
    return (
        <div className={classNames(styles.productCard, (shimmer) ? styles.shimmer : "")} onClick={shimmer?()=>{}:openProduct}>
            <div className={styles.prodImg} style={shimmer ? {} : { backgroundImage: `url('${product.image}')`}}></div>
            <div className={styles.prodDetWrap}>
            <p className={styles.prodName}>{shimmer ? "" : product.name}</p>
            <div style={{display:"flex",alignItems:"center"}}>
                <small className={styles.prodPrice}>
                    {shimmer ? "" : "₹ " + product.price.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,") }
                </small>
                {product.isSoulbound?<div className={styles.soulBound}>
                    Soulbound
                </div>:<></>}
            </div>
            {shimmer?<></>:<div className={styles.spacer}></div>}
            {shimmer ? <div className={styles.shimmerAdd}></div> : <></>}
            </div>
        </div>
    );
};

export default Product;
