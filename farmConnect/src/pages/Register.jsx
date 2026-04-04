import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register(){

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState("consumer");

  const navigate = useNavigate();


  const handleRegister = async ()=>{

    if(!name || !email || !password){
      alert("Please fill all fields");
      return;
    }

    const response = await fetch(
      "http://127.0.0.1:5000/register",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          name,
          email,
          password,
          role
        })
      }
    );

    const data = await response.json();

    alert(data.message);

    if(response.ok){
      navigate("/login");   // redirect after register
    }

  };


  return(

    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <div className="bg-white shadow p-6 rounded w-96">

        <h2 className="text-2xl mb-4 text-center">
          Register
        </h2>

        <input
          className="border p-2 mb-3 w-full rounded"
          placeholder="Name"
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          type="email"
          className="border p-2 mb-3 w-full rounded"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 mb-3 w-full rounded"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <select
          className="border p-2 mb-4 w-full rounded"
          onChange={(e)=>setRole(e.target.value)}
        >
          <option value="consumer">
            Register as Consumer
          </option>

          <option value="farmer">
            Register as Farmer
          </option>

        </select>

        <button
          onClick={handleRegister}
          className="bg-green-600 text-white p-2 w-full rounded hover:bg-green-700"
        >
          Register
        </button>

      </div>

    </div>

  );

}