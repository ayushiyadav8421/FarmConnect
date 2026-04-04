import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Categories(){

  const navigate = useNavigate();

  const [counts,setCounts] = useState({});

  const categories = [

    { name:"vegetables", icon:"🥦", color:"bg-green-100" },
    { name:"fruits", icon:"🍎", color:"bg-red-100" },
    { name:"dairy", icon:"🥛", color:"bg-blue-100" },
    { name:"grains", icon:"🌾", color:"bg-yellow-100" },
    { name:"herbs", icon:"🌿", color:"bg-emerald-100" },
    { name:"organic", icon:"🍃", color:"bg-lime-100" }

  ];


  useEffect(()=>{

    fetch("http://127.0.0.1:5000/category-count")
      .then(res=>res.json())
      .then(data=>setCounts(data));

  },[]);


  return(

    <div className="px-10 py-16 bg-gray-50">

      <h2 className="text-4xl font-bold text-center mb-12">
        Browse by Category
      </h2>


      <div className="grid grid-cols-3 gap-8">

        {categories.map(cat=>(

          <div
            key={cat.name}
            onClick={()=>navigate(`/products/${cat.name}`)}
            className={`${cat.color}
            rounded-xl
            p-10
            shadow
            cursor-pointer
            hover:shadow-xl
            hover:-translate-y-2
            transition
            text-center`}
          >

            <div className="text-5xl mb-4">
              {cat.icon}
            </div>

            <h3 className="text-xl font-bold capitalize">
              {cat.name}
            </h3>

            <p className="text-gray-600">
              {counts[cat.name] || 0} items
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}