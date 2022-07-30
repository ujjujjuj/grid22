import styles from "../styles/productview.module.css"

const ProductView = ({ product, select, resale }) => {

    const buyProduct = () => {
        //write code to buy product
        //product buy successful -> add to user orders
    };

    const goBack = () => {
        select({});
    }

    return (
        <>
            <section className={styles.prodViewWrap}>
                <div className={styles.backIcon} onClick={goBack}><i className="fa-solid fa-arrow-left-long"></i></div>
                <div className={styles.imageWrap}>
                    <div className={styles.imgHolder} style={{ backgroundImage: `url('${product.image}')` }}></div>
                </div>
                <div className={styles.contentWrap}>
                    {resale ? <p><i className="fas fa-star"></i>&nbsp;&nbsp;<span>Listed for Resale</span></p> : <></>}
                    <h1>{product.name}</h1>
                    <h2>₹ {product.price.replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")}</h2>
                    <h3>Product Details</h3>
                    <ul>
                        {product.features.map((x, n) => {
                            return <li key={n}>{x}</li>
                        })}
                    </ul>
                    {resale ? <div className={styles.resaleInfo}>
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
                    </div>:<></>}
                    <div className={styles.buyBtn} onClick={buyProduct}>
                        <i className="fa-solid fa-bolt-lightning"></i>&nbsp;&nbsp;BUY NOW
                    </div>
                </div>

            </section>
        </>
    );
};


export default ProductView;