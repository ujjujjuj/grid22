import { useEffect, useState } from "react";
import styles from "../styles/addproduct.module.css";
import { ethers } from "ethers";
import { useAuth } from "../hooks/auth";

const AddProduct = () => {
    const [formData, setFormData] = useState({
        pname: "",
        features: [],
        price: "",
        isSoulbound: false,
        imageUrl: "",
        warranty: "",
    });
    const [features, setFeatures] = useState("");

    const { web3Data } = useAuth();

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            setFormData((form) => ({ ...form, features: [...form.features, features] }));
            setFeatures("");
        }
    };

    const removeFeature = (value) => {
        setFormData((form) => ({
            ...form,
            features: form.features.filter((x, i) => {
                return i !== value;
            }),
        }));
    };

    useEffect(() => {
        console.log(formData);
    }, [formData]);

    const uploadData = async () => {
        const itemId = (await web3Data.contract.totalItems()).toNumber();
        // upload to db with this item id
        const itemURI = "http://grid.22/product/1";
        const warrantySeconds = parseFloat(formData.warranty) * 30 * 24 * 60 * 60;
        const weiValue = ethers.utils.parseEther(formData.price);
        try {
            await web3Data.contract.createItem(itemURI, weiValue, warrantySeconds, formData.isSoulbound);
            alert("Transaction successful!");
        } catch (e) {
            console.log(e);
            alert("failed");
        }
    };

    return (
        <>
            <section className={styles.prodViewWrap}>
                <form className={styles.formWrap}>
                    <input
                        name="pname"
                        placeholder="Product Name"
                        required
                        className={styles.nameInput}
                        value={formData.pname}
                        onChange={(e) => setFormData((old) => ({ ...old, pname: e.target.value }))}
                    />
                    <div className={styles.addFeaturesWrap}>
                        <input
                            name="features"
                            placeholder="Add Product Features"
                            required
                            className={styles.featureInput}
                            value={features}
                            onChange={(e) => setFeatures(e.target.value)}
                            onKeyUp={handleKeyDown}
                        />
                        {formData.features.length ? (
                            formData.features.map((x, i) => {
                                return (
                                    <div className={styles.featureWrap} key={i}>
                                        <p>{x}</p>
                                        <i
                                            className="fas fa-times"
                                            onClick={() => {
                                                removeFeature(i);
                                            }}
                                        ></i>
                                    </div>
                                );
                            })
                        ) : (
                            <></>
                        )}
                    </div>
                    <input
                        name="price"
                        placeholder="Price (ETH)"
                        required
                        value={formData.price}
                        type="number"
                        step={"0.01"}
                        min={0}
                        onChange={(e) => setFormData((old) => ({ ...old, price: e.target.value }))}
                        className={styles.priceInput}
                    />
                    <input
                        name="img"
                        placeholder="Image URL"
                        required
                        value={formData.imageUrl}
                        onChange={(e) => setFormData((old) => ({ ...old, imageUrl: e.target.value }))}
                        className={styles.imageInput}
                    />
                    <input
                        name="warr"
                        placeholder="Warranty Period (months)"
                        required
                        value={formData.warranty}
                        type="number"
                        min={1}
                        onChange={(e) => setFormData((old) => ({ ...old, warranty: e.target.value }))}
                    />
                    <div className={styles.soulboundWrap}>
                        <input
                            type="checkbox"
                            id="soulbound"
                            name="soulbound"
                            value="Soulbound"
                            onChange={() => setFormData((old) => ({ ...old, isSoulbound: !old.isSoulbound }))}
                        />
                        <label htmlFor="soulbound">Soulbound</label>
                    </div>
                    <div className={styles.submit} onClick={uploadData}>
                        Add Product
                    </div>
                </form>
            </section>
        </>
    );
};

export default AddProduct;
