import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "../Components/User/HomePage";
import Shop from "../Components/User/Shop";
import ProductPage from "../Components/User/ProductDetail";
import CategoryPages from "../Components/User/Category";
import FilterProduct from "../Components/User/FilterProduct";
import Subcategory from "../Components/User/SubCategory";
import Types from "../Components/User/Types";
import AboutPage from "../Components/Layouts/About";
import SellerPages from "../Components/User/Sellers";

const User: React.FC = () => {
    return (
      <>
        <Routes>
          <Route path="/" element={<Homepage/>} />
          <Route path="/Shop" element={<Shop/>} />
          <Route path="/product" element={<ProductPage/>} />
          <Route path="/product/:id" element={<ProductPage/>}/>
          <Route path="/category" element={<CategoryPages/>}/>
          <Route path="/seller-list/:seller/category/:category" element={<Subcategory/>}/>
          <Route path="/product-type/:category" element={<Types/>}/>
          <Route path="/products/:seller/:category/:id" element={<FilterProduct/>}/>
          <Route path="/about" element={<AboutPage/>}/>
          <Route path="/seller-list" element={<SellerPages/>}/>
          <Route path="/seller-list/:id" element={<CategoryPages/>}/>
       </Routes>
      </>
    );
  };
  
  export default User;
  