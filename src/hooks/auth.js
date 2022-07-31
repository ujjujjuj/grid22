import { useState, useContext, createContext, useEffect } from "react";
import contractInfo from "../data/FlipkartItem.json";
import contractAddress from "../data/polygontest.json";
import { ethers } from "ethers";

export const AuthContext = createContext({ isLoggedIn: false });
export const useAuth = () => useContext(AuthContext);

const setUserAddress = async (address, id) => {
    let req = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/modifyAddress`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: address, id: id }),
    });
    let res = await req.json();
    if (res.status === 1) console.log("done");
    else console.log("err");
};

const useProvideAuth = () => {
    const [user, setUser] = useState({ isLoggedIn: false, isMetamask: false });
    const [web3Data, setWeb3Data] = useState({ provider: null, contract: null });

    const loginUser = (data) => {
        let newUser = { ...data, isLoggedIn: true };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const logoutUser = () => {
        let newUser = { isLoggedIn: false };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const setMetaMask = (address) => {
        setUser((user) => {
            let old = user;
            return { ...old, meta: address };
        });
    };

    const connectMetamask = async () => {
        if (!window.ethereum) {
            alert("Get MetaMask!");
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const userAddress = await provider.getSigner().getAddress();
        console.log(userAddress);
        const contract = new ethers.Contract(contractAddress.address, contractInfo.abi, provider.getSigner());
        if (user.address !== userAddress) await setUserAddress(userAddress, user._id);

        setWeb3Data({ provider, contract });
        setUser((user) => ({ ...user, isMetamask: true, address: userAddress }));
        
        window.ethereum.on("accountsChanged", connectMetamask);
    };

    useEffect(() => {
        console.log("Address:", user.address);
    }, [user.address]);

    useEffect(() => {
        let loadedUser = JSON.parse(localStorage.getItem("user"));
        if (loadedUser === null) return localStorage.setItem("user", JSON.stringify(user));
        if (loadedUser.isLoggedIn) return loginUser(loadedUser);
    }, []);

    return {
        user,
        loginUser,
        logoutUser,
        setMetaMask,
        web3Data,
        connectMetamask,
    };
};

export const AuthProvider = ({ children }) => (
    <AuthContext.Provider value={useProvideAuth()}>{children}</AuthContext.Provider>
);
