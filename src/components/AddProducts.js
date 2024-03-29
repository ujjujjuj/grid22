import { useEffect, useState, useRef } from "react";
import styles from "../styles/addproduct.module.css";
import { ethers } from "ethers";
import { useAuth } from "../hooks/auth";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const [isPopVisible, setPopVisible] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        pname: "",
        features: [],
        price: "",
        isSoulbound: false,
        uploaded: false,
        warranty: "",
        imageId: "",
    });
    const [features, setFeatures] = useState("");

    const { web3Data } = useAuth();
    const [selectedFile, setSelectedFile] = useState("");
    const fileRef = useRef();

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && features) {
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
        if (formData.imageId.length > 0 && !formData.uploaded) uploadData();
    }, [formData]);

    const uploadImage = async () => {
        if (fileRef.current.files.length) {
            const formData = new FormData();
            formData.append("file", fileRef.current.files[0]);
            let res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/upload/image`, {
                method: "POST",
                body: formData,
            });
            let data = await res.json();
            // let data = { imageId: "42" };
            setFormData((oldFD) => ({ ...oldFD, imageId: data.imageId }));
        }
    };

    const uploadData = async () => {
        const itemId = (await web3Data.contract.totalItems()).toNumber();
        // const itemId = Math.floor(Math.random() * 424242);
        const itemURI = `${process.env.REACT_APP_SERVER_URL}/product/${itemId}`;
        const warrantySeconds = parseFloat(formData.warranty) * 30 * 24 * 60 * 60;
        const weiValue = ethers.utils.parseEther(formData.price);
        try {
            const tx = await web3Data.contract.createItem(itemURI, weiValue, warrantySeconds, formData.isSoulbound);
            console.log(tx);
            await fetch(`${process.env.REACT_APP_SERVER_URL}/api/upload/product`, {
                method: "POST",
                body: new URLSearchParams({
                    itemId,
                    name: formData.pname,
                    features: formData.features,
                    price: formData.price,
                    isSoulbound: formData.isSoulbound,
                    warranty: formData.warranty,
                    imageId: formData.imageId,
                }),
            });
            setFormData((oldFD) => ({ ...oldFD, uploaded: true }));
            setPopVisible(true);
        } catch (e) {
            console.log(e);
            // alert("failed");
        }
    };
    useEffect(() => {
        if (!isPopVisible && formData.uploaded) navigate("/");
    }, [isPopVisible]);

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
                            <h3>
                                The product was added
                                <br />
                                successfully!
                            </h3>
                            <div
                                className={styles.buyBtn}
                                onClick={() => {
                                    setPopVisible(false);
                                }}
                            >
                                <i className="fa-solid fa-bolt-lightning"></i>&nbsp;&nbsp;Continue
                            </div>
                        </div>
                    </>
                ) : (
                    <></>
                )}
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
                        step={"0.001"}
                        min={0}
                        onChange={(e) => setFormData((old) => ({ ...old, price: e.target.value }))}
                        className={styles.priceInput}
                    />
                    <input
                        className={styles.imageInput}
                        type="file"
                        ref={fileRef}
                        accept="image/png, image/gif, image/jpeg"
                        required
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
                    <div className={styles.submit} onClick={uploadImage}>
                        Add Product
                    </div>
                </form>
            </section>
        </>
    );
};

export default AddProduct;
