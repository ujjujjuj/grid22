import { useState, useContext, createContext, useEffect } from "react";
import contractInfo from "../data/FlipkartItem.json";
import contractAddress from "../data/localhost.json";
import {ethers} from "ethers"

export const AuthContext = createContext({ isLoggedIn: false });
export const useAuth = () => useContext(AuthContext);

const useProvideAuth = () => {
    const [user, setUser] = useState({ isLoggedIn: false , isMetamask: false});
    const [web3Data, setWeb3Data] = useState({ provider: null, contract: null });

    const loginUser = (data) => {
        let newUser = { ...data, isLoggedIn: true, isAdmin: false };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const logoutUser = () => {
        let newUser = { isLoggedIn: false };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const setMetaMask = (address)=>{
        setUser((user)=>{
            let old = user;
            return ({...old,meta:address})
        })
    }

    const setContractDetails = async ()=>{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const userAddress = await provider.getSigner().getAddress();
        const contract = new ethers.Contract(contractAddress.address, contractInfo.abi, provider);
        setWeb3Data({ provider, contract });
        console.log(userAddress)
        console.log(contractAddress.owner) 
        if(userAddress === contractAddress.owner){
            setUser((user)=>{
                let oldUser = user;
                return ({...oldUser,isAdmin:true})
            })
        }
    };

    useEffect(() => {
        let loadedUser = JSON.parse(localStorage.getItem("user"));
        if (loadedUser === null) return localStorage.setItem("user", JSON.stringify(user));
        if (loadedUser.isLoggedIn) return loginUser(loadedUser);
    },[]);

    useEffect(() => {

    }, [user]);

    return {
        user,
        loginUser,
        logoutUser,
        setContractDetails,
        setMetaMask,
        web3Data
    };
};

export const AuthProvider = ({ children }) => (
    <AuthContext.Provider value={useProvideAuth()}>{children}</AuthContext.Provider>
);
