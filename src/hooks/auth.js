import { useState, useContext, createContext, useEffect } from "react";

export const AuthContext = createContext({ isLoggedIn: false });
export const useAuth = () => useContext(AuthContext);

const useProvideAuth = () => {
    const [user, setUser] = useState("");

    const loginUser = (addr) => {
        setUser(addr);
        localStorage.setItem("user", addr);
    };

    const logoutUser = () => {
        setUser("");
        localStorage.setItem("user", "");
    };

    useEffect(() => {
        let loadedAddr = localStorage.getItem("user");
        if (loadedAddr) {
            loginUser(loadedAddr);
        }
    }, []);

    useEffect(() => {}, [user]);

    return {
        user,
        loginUser,
        logoutUser,
    };
};

export const AuthProvider = ({ children }) => <AuthContext.Provider value={useProvideAuth()}>{children}</AuthContext.Provider>;
