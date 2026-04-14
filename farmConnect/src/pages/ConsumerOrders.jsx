import { useEffect, useState } from "react";

export default function ConsumerOrders(){

  const [orders,setOrders] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const email = localStorage.getItem("user");

  useEffect(()=>{

    fetch(`http://127.0.0.1:5000/consumer-orders/${email}`)
      .then(res=>res.json())
      .then(data=>setOrders(data));

  },[]);


  // open feedback popup
  const openFeedback = (order) => {
    setSelectedOrder(order);
    setShowFeedback(true);
  };

  // submit feedback
  const submitFeedback = async () => {

    const res = await fetch("http://127.0.0.1:5000/add-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: localStorage.getItem("user_id"), // make sure you store this at login
        product_id: selectedOrder.product_id,     // requires backend fix
        order_id: selectedOrder.id,
        rating,
        comment
      })
    });

    const data = await res.json();
    alert(data.message);

    setShowFeedback(false);
    setRating(5);
    setComment("");
  };


  return(

    <div className="p-10">

      <h1 className="text-2xl mb-6">
        My Orders
      </h1>

      {orders.map(order=>(

        <div
          key={order.id}
          className="border p-4 mb-4 rounded shadow-sm"
        >

          <p><b>Product:</b> {order.product}</p>

          {/* Current status */}
          <p><b>Status:</b> {order.current_status}</p>

          {/* Tracking history */}
          <div className="mt-3">
            <p className="font-semibold">Tracking:</p>

            {order.history && order.history.length > 0 ? (
              order.history.map((h, i) => (
                <div key={i} className="text-green-600">
                  ✔ {h.status} - {new Date(h.time).toLocaleString()}
                </div>
              ))
            ) : (
              <p>No updates yet</p>
            )}

          </div>

          {/* Feedback button */}
          {order.current_status === "delivered" && (
            <button
              className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => openFeedback(order)}
            >
              Give Feedback
            </button>
          )}

        </div>

      ))}


      {/* FEEDBACK POPUP */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

          <div className="bg-white p-6 rounded w-80 shadow-lg">

            <h2 className="text-xl mb-3">Give Feedback</h2>

            <label className="block mb-1">Rating (1–5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e)=>setRating(e.target.value)}
              className="border p-2 w-full mb-3"
            />

            <label className="block mb-1">Comment</label>
            <textarea
              placeholder="Write your experience..."
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
              className="border p-2 w-full mb-3"
            />

            <div className="flex justify-between">

              <button
                onClick={submitFeedback}
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
              >
                Submit
              </button>

              <button
                onClick={()=>setShowFeedback(false)}
                className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>

  );

}