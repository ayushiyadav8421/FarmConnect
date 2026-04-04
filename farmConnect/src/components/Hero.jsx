import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Hero(){

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    farmers: 0,
    products: 0,
    consumers: 0
  });

  useEffect(() => {

    const fetchStats = () => {
      fetch("http://127.0.0.1:5000/stats")
        .then(res => res.json())
        .then(data => setStats(data));
    };

    fetchStats();

    const interval = setInterval(fetchStats, 5000); // auto update

    return () => clearInterval(interval);

  }, []);

  const handleShop = ()=>{
    navigate("/products");
  };

  const handleSell = ()=>{

    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if(user && role === "farmer"){
      navigate("/dashboard");
    }
    else if(user){
      alert("Only farmers can sell products");
    }
    else{
      navigate("/register");
    }

  };

  return(

    <div
      className="h-[600px] bg-cover bg-center flex items-center"
      style={{backgroundImage:"url('/image.png')"}}
    >

      <div className="ml-20 text-white max-w-xl">

        <p className="border px-4 py-1 rounded-full inline-block mb-4">
          Farm to Table, No Middlemen
        </p>

        <h1 className="text-6xl font-bold leading-tight">
          Fresh From the
          <span className="text-yellow-400"> Farm </span>
          to Your Table
        </h1>

        <p className="mt-4 text-lg">
          Connect directly with local farmers.
        </p>

        <div className="mt-6 space-x-4">

          <button
            onClick={handleShop}
            className="bg-green-700 px-6 py-3 rounded-lg"
          >
            Shop Now
          </button>

          <button
            onClick={handleSell}
            className="border px-6 py-3 rounded-lg"
          >
            Sell Your Produce
          </button>

        </div>

        {/* ✅ UPDATED DYNAMIC STATS */}
        <div className="flex gap-10 mt-8">

          <div>
            <h2 className="text-2xl font-bold">{stats.farmers}+</h2>
            Farmers
          </div>

          <div>
            <h2 className="text-2xl font-bold">{stats.products}+</h2>
            Products
          </div>

          <div>
            <h2 className="text-2xl font-bold">{stats.consumers}+</h2>
            Customers
          </div>

        </div>

      </div>

    </div>

  );

}