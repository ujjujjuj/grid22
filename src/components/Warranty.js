import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import styles from "../styles/addproduct.module.css";

const WarrantyReason = ["Wear and Tear", "Theft", "Water Damage"];
const WarrantyOutcome = ["Repair", "Replace"];

const Warranty = () => {
    const [formData, setFormData] = useState({ serialNo: "", warrantyReason: "", warrantyOutcome: "" });
    const { web3Data } = useAuth();
    useEffect(() => {
        console.log(formData);
    }, [formData]);

    const warrantyAdd = async () => {
        await web3Data.contract.addWarranty(
            parseInt(formData.serialNo),
            parseInt(formData.warrantyReason),
            parseInt(formData.warrantyOutcome)
        );
        alert("done");
    };

    return (
        <>
            <section className={styles.prodViewWrap}>
                <form className={styles.formWrap}>
                    <input
                        name="pname"
                        placeholder="Warranty Serial Number"
                        required
                        className={styles.nameInput}
                        value={formData.serialNo}
                        onChange={(e) => setFormData((old) => ({ ...old, serialNo: e.target.value }))}
                    />
                    <select
                        id="reason"
                        name="reason"
                        required
                        value={formData.warrantyReason}
                        onChange={(e) => setFormData((old) => ({ ...old, warrantyReason: e.target.value }))}
                    >
                        <option value={""}>Select a reason for Warranty</option>
                        {WarrantyReason.map((x, n) => {
                            return (
                                <option value={n} key={n}>
                                    {x}
                                </option>
                            );
                        })}
                    </select>
                    <select
                        id="reason"
                        name="reason"
                        required
                        value={formData.warrantyOutcome}
                        onChange={(e) => setFormData((old) => ({ ...old, warrantyOutcome: e.target.value }))}
                    >
                        <option value={""}>Select a Warranty Outcome</option>
                        {WarrantyOutcome.map((x, n) => {
                            return (
                                <option value={n} key={n}>
                                    {x}
                                </option>
                            );
                        })}
                    </select>
                    <div className={styles.submit} onClick={warrantyAdd}>
                        Add Warranty
                    </div>
                </form>
            </section>
        </>
    );
};

export default Warranty;
