// import React from 'react';
import Hero from '../Layouts/Hero';
import NavBar from '../Layouts/Navbar';
import Footer from '../Layouts/Footer';
// import Shop from './Shop';

function Homepage() {
  return (
    <>
      {/* Set color={true} to always have black background */}
      <NavBar isTransparent={true} />  
          <Hero />
      {/* <Shop /> */}
      <Footer />
    </>
  );
}

export default Homepage;
