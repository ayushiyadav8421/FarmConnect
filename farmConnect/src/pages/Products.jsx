import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Products() {

  const role = localStorage.getItem("role");
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();
  const { category } = useParams();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const search = params.get("search");


  // FETCH PRODUCTS
  useEffect(() => {

    let url = "http://127.0.0.1:5000/products";

    if (category) {
      url += `?category=${category}`;
    }

    if (search) {
      url += `?search=${search}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data));

  }, [category, search]);


  // BUY
  const buyProduct = async (product) => {

    const consumer = localStorage.getItem("user");

    if (!consumer) {
      alert("Please login first");
      return;
    }

    const res = await fetch(
      "http://127.0.0.1:5000/place-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: product.id,
          consumer_email: consumer,
          farmer_email: product.farmer_email
        })
      }
    );

    const data = await res.json();
    alert(data.message);

  };

  // Cart
  const addToCart = (product) => {
    const user = localStorage.getItem("user"); // 👈 get logged-in user

    if (!user) {
      alert("Please login first");
      return;
    }

    let cart = JSON.parse(localStorage.getItem(`cart_${user}`)) || [];

    // ✅ prevent duplicates
    const exists = cart.find(item => item.id === product.id);

    if (exists) {
      alert("Already in cart");
      return;
    }

    cart.push(product);

    localStorage.setItem(`cart_${user}`, JSON.stringify(cart)); // 👈 FIXED

    alert("Added to cart ✅");
  };


  // CONTACT
  const contactFarmer = (email) => {
    alert(`Contact farmer at: ${email}`);
  };


  return (

    <div className="p-10">

      <div className="grid grid-cols-3 gap-6">

        {products.map(product => (

          <div
            key={product.id}
            className="border p-4 shadow rounded"
          >

            <img
              src={`http://127.0.0.1:5000/images/${product.image}`}
              alt={product.name}
              className="w-full h-40 object-cover"
            />

            <h2 className="text-xl font-bold">
              {product.name}
            </h2>

            <p>
              Category: {product.category}
            </p>

            <p>
              Price: ₹{product.price}
            </p>


            <button
              onClick={() => contactFarmer(product.farmer_email)}
              className="bg-green-600 text-white px-4 py-2 mt-2 rounded w-full"
            >
              Contact Farmer
            </button>


            {role === "consumer" && (
              <>
                <button
                  onClick={() => buyProduct(product)}
                  className="bg-blue-600 text-white px-4 py-2 mt-2 rounded w-full"
                >
                  Buy Product
                </button>

                <button
                  onClick={() => addToCart(product)}
                  className="bg-yellow-500 text-white px-4 py-2 mt-2 rounded w-full"
                >
                  Add to Cart 🛒
                </button>
              </>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}