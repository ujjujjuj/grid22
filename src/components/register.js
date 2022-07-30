import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import styles from '../styles/auth1.module.css';
import { useAuth } from "../hooks/auth";

const Register = () => {
    const [formData, setFormData] = useState({ email: "", password: "", fname: "", phone: "" });
    const { loginUser,user } = useAuth();
    const [passVisible, setPassVisible] = useState(false);
    const navigate = useNavigate();
    const [errorMsg, setError] = useState('');
    const togglePass = () => {
        setPassVisible(!passVisible);
    }

    const formSubmit = (e) => {
        e.preventDefault();
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long")
            return;
        }
        fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status !== 1) {
                    setError(data.message)
                    return console.log(data);
                }
                console.log(data)
                loginUser(data.data);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(()=>{
        if(user.isLoggedIn)
        navigate("/login");
    },[user])

    return (
        <>
            <section className={styles.regSec}>
            <main className={styles.regWrap}>
            <div className={styles.headerWrap}><img src="/assets/images/flipkart-logo.png" className={styles.flipLogo}  alt="Flipkart Logo"/><p>FlipGrid'22</p></div>
                <form onSubmit={formSubmit}>
                    <input name="fname" placeholder="Full Name" required
                        value={formData.fname}
                        onChange={(e) => setFormData((old) => ({ ...old, fname: e.target.value }))}
                    />    
                    <input name="phone" placeholder="Phone" required
                        value={formData.phone}
                        onChange={(e) => setFormData((old) => ({ ...old, phone: e.target.value }))}
                    />
                    <input name="email" placeholder="E-mail" type="email" required
                        value={formData.email}
                        onChange={(e) => setFormData((old) => ({ ...old, email: e.target.value }))}
                    />
                    <div className={styles.passWrap}><input name="password" placeholder="Password" type={passVisible ? "text" : "password"} required onChange={(e) => setFormData((old) => ({ ...old, password: e.target.value }))} /><i className={passVisible ? "fas fa-eye-slash" : "fas fa-eye"} onClick={togglePass}></i></div>

                    <input type="submit" value="Continue" />
                </form>

                <div className={styles.login}>
                    Already have an account? <Link to="/login">Login</Link>
                </div>
                <div className={styles.error} style={{ paddingBottom: " 30px" }}>
                    {errorMsg.length ? <i className="fas fa-exclamation-circle"></i> : <></>}<p id="error-msg">{errorMsg}</p>
                </div>
            </main>
            </section>
        </>
    );
};

export default Register;
