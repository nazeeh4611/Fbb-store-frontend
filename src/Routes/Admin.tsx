import React from "react";
import { Route, Routes } from "react-router-dom";
import CategoryManager from "../Components/Admin/Category";
import ProductPage from "../Components/Admin/Product";
import SubCategory from "../Components/Admin/Subcategory";
import ProductType from "../Components/Admin/ProductType";
import AdminLogin from "../Components/Admin/Login";
import Protect from "./Protect/Protected";
import ReProtect from "./Protect/ReverseProtect";
import SellerPage from "../Components/Admin/Sellers";
import SellerProducts from "../Components/Admin/SellerProduct";


const Admin: React.FC = () => {
    return (
      <>
        <Routes>
          <Route path="/category" element={<CategoryManager/>} />
          <Route path="/sub-category" element={<Protect component={SubCategory}/>} />
          <Route path="/product-type" element={<Protect component={ProductType}/>} />
          <Route path="/product" element={<Protect component={ProductPage}/>} />
          <Route path="/login" element={<ReProtect component={AdminLogin}/>} />
          <Route path="/sellers" element={<Protect component={SellerPage} />} />     
          <Route path="/sellers/:id" element={<Protect component={SellerProducts} />} />     
           </Routes>
      </>
    );
  };
  
  export default Admin;
  