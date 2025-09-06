
export const useGetToken = (name: string) => {
    try {
        console.log("Name received:", name);
        const localStorageToken = localStorage.getItem(name);

        if (localStorageToken) {
          return localStorageToken
        } else {
            console.log("No token found in localStorage for", name);
        }

        return null;
    } catch (error) {
        console.error("Error occurred while getting token:", error);
        return null;
    }
};
