// import { DecodedToken } from "../Interfacetypes/types";
// import { useDispatch } from "react-redux";


const ExtractToken = (token:string | null) => {
  if (!token) {
    console.error("Token not provided for the extraction");
    return null;
  }

  try {
    const tokenpart = token.split(".")[1];
    if (!tokenpart) {
      console.error("Invalid token format");
      return null;
    }

    const decodedToken = JSON.parse(atob(tokenpart));

    return decodedToken;
  } catch (error) {
    console.error("Error occurred while extracting the token");
    return null;
  }
};

export default ExtractToken;
