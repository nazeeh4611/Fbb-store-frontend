import { useState, useEffect } from "react";

export const useGetToken = (name: string) => {
    const [token, setToken] = useState<string | null>(() => {
        // Initial value from localStorage
        return localStorage.getItem(name);
    });

    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem(name));
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [name]);

    return token;
};