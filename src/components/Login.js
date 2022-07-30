import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/auth";
import styles from "../styles/auth.module.css";
import styles1 from "../styles/auth1.module.css";


async function connect(onConnected) {
  if (!window.ethereum) {
    alert("Get MetaMask!");
    return;
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  onConnected(accounts[0]);
}


async function checkIfWalletIsConnected(onConnected) {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length > 0) {
      const account = accounts[0];
      onConnected(account);
      return;
    }
  }
}



export default function Login({ onAddressChanged }) {
  const [userAddress, setUserAddress] = useState("");

  const { loginUser, user, setContractDetails,setMetaMask } = useAuth();
  const navigate = useNavigate();
  const initialise = () => {
    checkIfWalletIsConnected(setUserAddress);
  }

  useEffect(()=>{
    initialise()
  },[])

  useEffect(() => {
    if (userAddress && user.isLoggedIn) {
      setMetaMask(userAddress)
      setContractDetails()
      navigate("/")
    }
  }, [userAddress,user])

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [passVisible, setPassVisible] = useState(false);
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
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/login`, {
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
        loginUser(data.data);
        initialise();
      })
      .catch((e) => {
        console.log(e);
      });
  };


  return (<>
    <section className={styles.authSection}>

      {user.isLoggedIn && !userAddress.length ? <>
        <img src="/assets/images/flipkart-logo.png" className={styles.flipLogo} alt="Flipkart Logo" />
        <div className={styles.metaWrap}>
          <img src="/assets/images/meta-logo.svg.png" width={100} alt="MetaMask Logo" />
          <div className={styles.button} onClick={() => connect(setUserAddress)}>
            Connect to MetaMask
          </div>
        </div>
      </> :
        <main className={styles1.regWrap}>
          <div className={styles1.headerWrap}><img src="/assets/images/flipkart-logo.png" className={styles1.flipLogo} alt="Flipkart Logo" /><p>FlipGrid'22</p></div>

          <form onSubmit={formSubmit}>
            <input name="email" placeholder="E-mail" type="email" required
              value={formData.email}
              onChange={(e) => setFormData((old) => ({ ...old, email: e.target.value }))}
            />
            <div className={styles1.passWrap}><input name="password" placeholder="Password" type={passVisible ? "text" : "password"} required onChange={(e) => setFormData((old) => ({ ...old, password: e.target.value }))} /><i className={passVisible ? "fas fa-eye-slash" : "fas fa-eye"} onClick={togglePass}></i></div>

            <input type="submit" value="Continue" />
          </form>

          <div className={styles1.login}>
            Don't have an account? <Link to="/register">Register</Link>
          </div>
          <div className={styles1.error} style={{ paddingBottom: " 30px" }}>
            {errorMsg.length ? <i className="fas fa-exclamation-circle"></i> : <></>}<p id="error-msg">{errorMsg}</p>
          </div>
        </main>}
    </section>
  </>);


}


