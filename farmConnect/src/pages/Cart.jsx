import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("user");

    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState("");

    // ✅ Redirect farmer
    useEffect(() => {
        if (role === "farmer") {
            navigate("/dashboard");
        }
    }, [role, navigate]);

    // ✅ Load address
    useEffect(() => {
        const saved = localStorage.getItem("address");
        if (saved) setAddress(saved);
    }, []);

    // ✅ Load cart
    useEffect(() => {
        let data = JSON.parse(localStorage.getItem(`cart_${user}`)) || [];

        const updated = data.map(item => ({
            ...item,
            quantity: item.quantity || 1
        }));

        setCart(updated);
    }, [user]);

    // ✅ update cart
    const updateCart = (updated) => {
        const user = localStorage.getItem("user");

        setCart(updated);
        localStorage.setItem(`cart_${user}`, JSON.stringify(updated));
    };

    // ✅ remove item
    const removeItem = (index) => {
        const updated = [...cart];
        updated.splice(index, 1);
        updateCart(updated);
    };

    // ✅ increase qty
    const increaseQty = (index) => {
        const updated = [...cart];
        updated[index].quantity += 1;
        updateCart(updated);
    };

    // ✅ decrease qty
    const decreaseQty = (index) => {
        const updated = [...cart];
        if (updated[index].quantity > 1) {
            updated[index].quantity -= 1;
            updateCart(updated);
        }
    };

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="bg-gray-100 min-h-screen p-6">

            <h1 className="text-3xl font-bold mb-6">🛒 Shopping Cart</h1>

            {cart.length === 0 ? (
                <div className="text-center mt-20 text-gray-600">
                    <p className="text-xl">Your cart is empty 😔</p>
                </div>
            ) : (

                <div className="grid grid-cols-3 gap-6">

                    {/* LEFT SIDE */}
                    <div className="col-span-2 bg-white p-6 rounded shadow">

                        {cart.map((item, index) => (

                            <div
                                key={index}
                                className="flex gap-6 border-b py-6 items-center"
                            >

                                {/* IMAGE */}
                                <img
                                    src={`http://127.0.0.1:5000/images/${item.image}`}
                                    alt={item.name}
                                    className="w-28 h-28 object-cover rounded"
                                />

                                {/* DETAILS */}
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold">{item.name}</h2>
                                    <p className="text-gray-500">{item.category}</p>
                                    <p className="text-xl font-semibold mt-2">
                                        ₹{item.price}
                                    </p>

                                    {/* QUANTITY */}
                                    <div className="flex items-center gap-3 mt-3">

                                        <button
                                            onClick={() => decreaseQty(index)}
                                            className="px-3 py-1 bg-gray-200 rounded"
                                        >
                                            -
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            onClick={() => increaseQty(index)}
                                            className="px-3 py-1 bg-gray-200 rounded"
                                        >
                                            +
                                        </button>

                                    </div>

                                    {/* REMOVE */}
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="text-red-500 mt-3"
                                    >
                                        Remove
                                    </button>
                                </div>

                                {/* SUBTOTAL */}
                                <div className="text-lg font-bold">
                                    ₹{item.price * item.quantity}
                                </div>

                            </div>

                        ))}

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="bg-white p-6 rounded shadow h-fit sticky top-6">

                        <h2 className="text-xl font-bold mb-4">
                            Price Details
                        </h2>

                        <div className="flex justify-between mb-2">
                            <span>Items ({cart.length})</span>
                            <span>₹{total}</span>
                        </div>

                        <div className="flex justify-between mb-2">
                            <span>Delivery</span>
                            <span className="text-green-600">FREE</span>
                        </div>

                        <hr className="my-4" />

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>

                        <textarea
                            placeholder="Enter delivery address..."
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                localStorage.setItem("address", e.target.value);
                            }}
                            className="w-full border p-3 rounded mt-4"
                            rows={3}
                        />

                        <button
                            onClick={async () => {
                                if (!address) {
                                    alert("Please enter address");
                                    return;
                                }

                                try {
                                    const res = await fetch("http://127.0.0.1:5000/place-order", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            consumer_email: user,   // ✅ ADD HERE
                                            cart: cart.map(item => ({
                                                product_id: item.id,   // ✅ ADD HERE
                                                quantity: item.quantity
                                            })),
                                            address: address
                                        })
                                    });

                                    const data = await res.json();

                                    if (res.ok) {
                                        localStorage.removeItem(`cart_${user}`);
                                        setCart([]);
                                        setAddress("");
                                        alert("Order placed successfully ✅");
                                    } else {
                                        alert(data.message || "Error placing order");
                                    }

                                } catch (err) {
                                    console.error(err);
                                    alert("Server error");
                                }
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-3 mt-6 rounded-xl font-bold text-lg shadow-md transition duration-200 cursor-pointer"
                        >
                            Place Order
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}