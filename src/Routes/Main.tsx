import React from "react";
import {Route, BrowserRouter as Router, Routes } from "react-router-dom";
import User from "./User";
import Admin from "./Admin";
import ScrollToTop from "../Components/Layouts/Scoll";
import Seller from "./Seller";



const Approutes:React.FC = ()=>{

    return(
       
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/*" element={<User/>}/>
              
                <Route path="/admin/*" element={<Admin/>} />
                <Route path="/seller/*" element={<Seller/>} />
            </Routes>
        </Router>
    )
}


export default Approutes