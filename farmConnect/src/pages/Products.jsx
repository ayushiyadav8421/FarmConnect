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
  const [feedbacks, setFeedbacks] = useState({});
  const userId = localStorage.getItem("user_id");

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

  //feedback
  useEffect(() => {
    products.forEach(product => {
      fetch(`http://127.0.0.1:5000/product-feedback/${product.id}`)
        .then(res => res.json())
        .then(data => {
          setFeedbacks(prev => ({
            ...prev,
            [product.id]: data
          }));
        });
    });
  }, [products]);

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

                {/* ⭐ FEEDBACK SECTION */}
                <div className="mt-3">
                  {/* Average Rating */}
                  {(() => {
                    const productFeedback = feedbacks[product.id] || [];

                    const avgRating =
                      productFeedback.length > 0
                        ? (
                          productFeedback.reduce((sum, f) => sum + f.rating, 0) /
                          productFeedback.length
                        ).toFixed(1)
                        : 0;

                    return (
                      <p className="text-sm font-bold text-yellow-600">
                        ⭐ {avgRating} / 5 ({productFeedback.length} reviews)
                      </p>
                    );
                  })()}

                  {/* Reviews */}
                  {(feedbacks[product.id] || []).length === 0 ? (
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                  ) : (
                    (feedbacks[product.id] || []).slice(0, 2).map((f, i) => (
                      // <div key={i} className="border p-2 mt-1 rounded text-sm">
                      //   <p className="font-semibold">{f.user}</p>

                      //   {/* ⭐ Star UI */}
                      //   <p className="text-yellow-500">
                      //     {"⭐".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                      //   </p>

                      //   <p>{f.comment}</p>
                      // </div>
                      <div
                        key={i}
                        className={`border p-2 mt-1 rounded text-sm ${f.user_id == userId ? "bg-yellow-50 border-yellow-400" : ""
                          }`}
                      >
                        <p className="font-semibold">{f.user}</p>

                        <p className="text-yellow-500">
                          {"⭐".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                        </p>

                        <p>{f.comment}</p>

                        {/* ✏️ EDIT BUTTON */}
                        {f.user_id == userId && (
                          <button
                            onClick={() => {
                              const newRating = prompt("Enter new rating (1-5):", f.rating);
                              const newComment = prompt("Edit your comment:", f.comment);

                              if (!newRating || !newComment) return;

                              fetch("http://127.0.0.1:5000/add-feedback", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                  user_id: userId,
                                  product_id: product.id,
                                  rating: parseInt(newRating),
                                  comment: newComment
                                })
                              })
                                .then(res => res.json())
                                .then(data => {
                                  alert(data.message);

                                  // 🔄 refresh feedback
                                  fetch(`http://127.0.0.1:5000/product-feedback/${product.id}`)
                                    .then(res => res.json())
                                    .then(data => {
                                      setFeedbacks(prev => ({
                                        ...prev,
                                        [product.id]: data
                                      }));
                                    });
                                });
                            }}
                            className="text-blue-500 text-xs mt-1 underline"
                          >
                            Edit your review
                          </button>
                        )}
                      </div>
                    ))
                  )}

                </div>

              </>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}