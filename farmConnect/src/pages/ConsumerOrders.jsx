import { useEffect, useState } from "react";

export default function ConsumerOrders(){

  const [orders,setOrders] = useState([]);

  const email = localStorage.getItem("user");

  useEffect(()=>{

    fetch(`http://127.0.0.1:5000/consumer-orders/${email}`)
      .then(res=>res.json())
      .then(data=>setOrders(data));

  },[]);


  return(

    <div className="p-10">

      <h1 className="text-2xl mb-6">
        My Orders
      </h1>

      {orders.map(order=>(

        <div
          key={order.id}
          className="border p-4 mb-4 rounded"
        >

          <p><b>Product:</b> {order.product}</p>

          {/* ✅ current status */}
          <p><b>Status:</b> {order.current_status}</p>

          {/* ✅ history tracking */}
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

        </div>

      ))}

    </div>

  );

}