import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerOrders from "./pages/FarmerOrders";
import ConsumerOrders from "./pages/ConsumerOrders";
import Cart from "./pages/Cart";

export default function App() {

  return (

    <BrowserRouter>
      <div className="flex flex-col min-h-screen">

        {/* Navbar ONLY ONCE */}
        <Navbar />

        {/* Page content */}
        <div className="flex-grow pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer-orders" element={<FarmerOrders />} />
            <Route path="/my-orders" element={<ConsumerOrders />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>

        {/* Footer ONLY ONCE */}
        <Footer />
      </div>

    </BrowserRouter>
    
  );
}