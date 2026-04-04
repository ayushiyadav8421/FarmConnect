import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const user = localStorage.getItem("user");

  const navigate = useNavigate();

  const cart = JSON.parse(localStorage.getItem(`cart_${user}`)) || [];
  const displayName = name || user || "";

  const categories = [
    "vegetables",
    "fruits",
    "dairy",
    "grains",
    "herbs",
    "organic"
  ];

  /* SEARCH STATE */
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = async (e) => {

    const value = e.target.value;

    setSearch(value);

    if (value.length === 0) {
      setSuggestions([]);
      return;
    }

    const res = await fetch(
      `http://127.0.0.1:5000/search-suggestions?q=${value}`
    );

    const data = await res.json();

    setSuggestions(data);
  };

  const handleLogout = () => {

    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };


  return (

    <div className="flex justify-between items-center px-10 py-4 bg-white shadow-sm">

      {/* LOGO */}
      <Link to="/" className="text-2xl font-bold text-green-700">
        🌿 FarmConnect
      </Link>


      {/* NAV MENU */}
      <div className="flex items-center gap-8 text-gray-600">

        <Link to="/">Home</Link>


        {/* PRODUCTS DROPDOWN */}
        <div className="relative group">

          <button className="hover:text-green-700">
            Products ▾
          </button>

          <div className="absolute hidden group-hover:block bg-white shadow rounded w-48">

            <div
              onClick={() => navigate("/products")}
              className="px-4 py-2 hover:bg-green-100 cursor-pointer"
            >
              All Products
            </div>

            {categories.map(cat => (
              <div
                key={cat}
                onClick={() => navigate(`/products/${cat}`)}
                className="px-4 py-2 hover:bg-green-100 cursor-pointer capitalize"
              >
                {cat}
              </div>
            ))}

          </div>

        </div>


        <Link to="/about">About</Link>

        {role === "farmer" &&
          <button onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        }

        {role === "farmer" &&
          <button onClick={() => navigate("/farmer-orders")}>
            Orders
          </button>
        }

        {role === "consumer" &&
          <button onClick={() => navigate("/my-orders")}>
            My Orders
          </button>
        }
        {/* LIVE SEARCH BAR WITH ICON */}
        <div className="relative">

          {/* input + icon container */}
          <div className="flex items-center border rounded overflow-hidden">

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="px-3 py-1 outline-none w-56"
            />

            {/* SEARCH ICON BUTTON */}
            <button
              onClick={() => {
                if (search.trim() !== "") {
                  navigate(`/products?search=${search}`);
                  setSuggestions([]);
                }
              }}
              className="bg-green-600 text-white px-3 py-1 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </button>

          </div>

          {/* suggestions dropdown */}
          {suggestions.length > 0 && (

            <div className="absolute bg-white border shadow w-full z-50">

              {suggestions.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(`/products?search=${item.name}`);
                    setSearch("");
                    setSuggestions([]);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item.name}
                </div>
              ))}

            </div>

          )}

        </div>


      </div>


      {/* USER SECTION */}
      <div className="flex items-center gap-4">

        {displayName ? (

          <>
            {role === "consumer" && (
              <button onClick={() => navigate("/cart")}>
                Cart 🛒 ({cart.length})
              </button>
            )}

            <div className="flex items-center gap-2">

              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <span>{displayName}</span>

            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </>

        ) : (

          <>
            <Link to="/login">Sign In</Link>

            <Link
              to="/register"
              className="bg-green-700 text-white px-4 py-2 rounded"
            >
              Get Started
            </Link>
          </>
        )}

      </div>

    </div>

  );

}