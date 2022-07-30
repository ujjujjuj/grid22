import { useState, useContext, createContext, useEffect } from "react";
import { ethers } from "ethers";
import contractInfo from "../data/FlipkartItem.json";
import contractAddress from "../data/localhost.json";

export const AuthContext = createContext({ isLoggedIn: false });
export const useAuth = () => useContext(AuthContext);

const useProvideAuth = () => {
    const [user, setUser] = useState("");
    const [web3Data, setWeb3Data] = useState({ provider: null, contract: null });

    const loginUser = (addr) => {
        setUser(addr);
        localStorage.setItem("user", addr);
    };

    const logoutUser = () => {
        setUser("");
        localStorage.setItem("user", "");
    };

    const connectToWallet = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const userAddress = await provider.getSigner().getAddress();
        const contract = new ethers.Contract(contractAddress.address, contractInfo.abi, provider);
        setUser(userAddress);
        setWeb3Data({ provider, contract });
    };

    useEffect(() => {
        let loadedAddr = localStorage.getItem("user");
        if (loadedAddr) {
            loginUser(loadedAddr);
        }
    }, []);

    useEffect(() => {
        console.log(web3Data);
    }, [web3Data]);

    return {
        user,
        loginUser,
        logoutUser,
        connectToWallet,
    };
};

export const AuthProvider = ({ children }) => (
    <AuthContext.Provider value={useProvideAuth()}>{children}</AuthContext.Provider>
);
