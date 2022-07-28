import classNames from "classnames";
import { useEffect, useState } from "react";
import styles from "../styles/shop.module.css";
import Product from "./Product";
import productsJson from "../data/products.json"
import resaleProductsJson from "../data/resaleProducts.json"

import ProductView from "./ProductView";

const Products = ({resale})=>{
    const [selectedProd,setSelectedProd]= useState({});
    const [products,setProducts] = useState([]);
    
    useEffect(()=>{
        setSelectedProd({})
        if(resale)
        setProducts(resaleProductsJson.data);
        else
        setProducts(productsJson.data);
    },[resale])

    return (<>
        {selectedProd.name?<ProductView product={selectedProd} select={setSelectedProd} resale={resale}/>:<section className={classNames(styles.products,styles.shopPage)}>
                {products.length===0?
                <><Product shimmer="true"/>
                <Product shimmer="true"/>
                <Product shimmer="true"/>
                <Product shimmer="true"/>
                </>:
                products.map((product) => (
                    <Product key={product.id} shimmer={false} selectHook={setSelectedProd} product={product} />
                ))}
            </section>}
    </>)
}

export default Products;