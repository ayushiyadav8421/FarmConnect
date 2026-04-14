import { useEffect, useState } from "react";

export default function FarmerOrders() {

  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState({});
  const email = localStorage.getItem("user");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/farmer-orders/${email}`)
      .then(res => res.json())
      .then(data => {
        console.log("ORDERS:", data);
        setOrders(data);

        // 👇 THIS IS THE KEY PART
        data.forEach(order => fetchHistory(order.id));
      });
  }, [email]);

  const fetchHistory = async (orderId) => {
    const res = await fetch(`http://127.0.0.1:5000/order-history/${orderId}`);
    const data = await res.json();

    setHistory(prev => ({
      ...prev,
      [orderId]: data
    }));
  };

  const updateStatus = async (id, newStatus) => {

    try {
      const res = await fetch(`http://127.0.0.1:5000/update-order/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      const data = await res.json();

      setOrders(prev =>
        prev.map(order =>
          order.id === id
            ? {
              ...order,
              status: data.status || order.status,   // 🔥 SAFE FIX
              updated_at: data.updated_at || order.updated_at
            }
            : order
        )
      );

    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="p-10">

      <h1 className="text-2xl mb-6">Orders Received</h1>

      {orders.map(order => {

        const status = (order.status || "").toLowerCase();

        return (
          <div key={order.id} className="border p-5 mb-5 rounded shadow">

            <p><b>Product:</b> {order.product || "Product Removed"}</p>
            <p><b>Consumer:</b> {order.consumer}</p>
            <p><b>Address:</b> {order.address}</p>

            {/* 🎨 STATUS COLORS */}
            <p className={
              status === "pending" ? "text-gray-500" :
                status === "accepted" ? "text-yellow-500" :
                  status === "packed" ? "text-orange-500" :
                    status === "out_for_delivery" ? "text-blue-500" :
                      status === "delivered" ? "text-green-600" :
                        "text-red-500"
            }>
              <b>Status:</b> {status}
            </p>

            {/* 🕒 TIME */}
            <p className="text-sm text-gray-500">
              <p>
                Updated At: {
                  order.updated_at
                    ? new Date(order.updated_at).toLocaleString()
                    : "Old order (time not tracked)"
                }
              </p>
            </p>

            {/* 📦 TIMELINE */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm">

              <span className={status !== "pending" ? "text-green-600" : ""}>
                ✔ Pending
              </span>

              <span className={["accepted", "packed", "out_for_delivery", "delivered"].includes(status) ? "text-green-600" : ""}>
                ✔ Accepted
              </span>

              <span className={["packed", "out_for_delivery", "delivered"].includes(status) ? "text-green-600" : ""}>
                ✔ Packed
              </span>

              <span className={["out_for_delivery", "delivered"].includes(status) ? "text-green-600" : ""}>
                ✔ Out for Delivery
              </span>

              <span className={status === "delivered" ? "text-green-600" : ""}>
                ✔ Delivered
              </span>

              {status === "cancelled" && (
                <span className="text-red-500">✖ Cancelled</span>
              )}

            </div>

            <div className="mt-3 text-sm">
              <b>History:</b>

              {history[order.id]?.map((h, index) => (
                <p key={index}>
                  ✔ {h.status} - {new Date(h.time).toLocaleString()}
                </p>
              ))}
            </div>

            {/* 🔘 ACTION BUTTONS */}
            <div className="mt-4 flex flex-wrap gap-2">

              {status === "pending" && (
                <button
                  onClick={() => updateStatus(order.id, "accepted")}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Accept Order
                </button>
              )}

              {status === "accepted" && (
                <button
                  onClick={() => updateStatus(order.id, "packed")}
                  className="bg-orange-500 text-white px-3 py-1 rounded"
                >
                  Mark Packed
                </button>
              )}

              {status === "packed" && (
                <button
                  onClick={() => updateStatus(order.id, "out_for_delivery")}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Out for Delivery
                </button>
              )}

              {status === "out_for_delivery" && (
                <button
                  onClick={() => updateStatus(order.id, "delivered")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Mark Delivered
                </button>
              )}

              {/* ❌ Cancel option */}
              {status !== "delivered" && status !== "cancelled" && (
                <button
                  onClick={() => updateStatus(order.id, "cancelled")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Cancel Order
                </button>
              )}

              {/* ✅ Completed */}
              {status === "delivered" && (
                <span className="text-green-600 font-semibold">
                  ✔ Completed
                </span>
              )}

            </div>

          </div>
        );
      })}

    </div>
  );
}