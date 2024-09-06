import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.css'; // Assuming CSS is in this file

const Layout = ({ children }) => {
  return (
    <div className="main-wrapper">
      <Header />
      <div className="content">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;