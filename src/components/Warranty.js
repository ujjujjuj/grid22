import { useEffect, useState } from "react";
import styles from "../styles/addproduct.module.css";


const WarrantyReason = ["Wear and Tear","Theft"]
const WarrantyOutcome = ["Repair","Replace"]

const Warranty = () => {
    const [formData, setFormData] = useState({ serialNo: "", warrantyReason:"",warrantyOutcome:""});
    useEffect(()=>{
        console.log(formData)
    },[formData])

    return (<>
        <section className={styles.prodViewWrap}>
            <form className={styles.formWrap}>
                <input name="pname" placeholder="Warranty Serial Number" required
                    className={styles.nameInput}
                    value={formData.serialNo}
                    onChange={(e) => setFormData((old) => ({ ...old, serialNo: e.target.value }))}
                    
                />
                 <select id="reason" name="reason" required value={formData.warrantyReason} onChange={(e)=>setFormData((old)=>({...old,warrantyReason:e.target.value}))} >
                    <option value={""} >Select a reason for Warranty</option>
                    {WarrantyReason.map((x,n)=>{
                        return <option value={n} key={n} >{x}</option>
                    })}
                </select>
                <select id="reason" name="reason" required value={formData.warrantyOutcome} onChange={(e)=>setFormData((old)=>({...old,warrantyOutcome:e.target.value}))}>
                    <option value={""} >Select a Warranty Outcome</option>
                    {WarrantyOutcome.map((x,n)=>{
                        return <option value={n} key={n} >{x}</option>
                    })}
                </select>
                <div className={styles.submit}>
                     Add Warranty
                </div>

            </form>

        </section>
    </>)
}

export default Warranty;