import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [selectedRole,setSelectedRole] = useState("");

  const navigate = useNavigate();


  const handleLogin = async(e)=>{

    e.preventDefault();

    if(!selectedRole){
      alert("Please select role");
      return;
    }

    const res = await fetch(
      "http://127.0.0.1:5000/login",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await res.json();

    if(!res.ok){
      alert(data.message);
      return;
    }

    // check role match
    if(data.role !== selectedRole){
      alert(`This account is registered as ${data.role}`);
      return;
    }

    localStorage.setItem("user",data.email);
    localStorage.setItem("name",data.name);
    localStorage.setItem("role",data.role);

    alert("Login successful");

    if(data.role==="farmer"){
      navigate("/dashboard");
    }
    else{
      navigate("/products");
    }

  };


  return(

    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>


        {/* ROLE SELECT */}

        <select
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setSelectedRole(e.target.value)}
        >

          <option value="">
            Select Role
          </option>

          <option value="consumer">
            Login as Consumer
          </option>

          <option value="farmer">
            Login as Farmer
          </option>

        </select>


        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setPassword(e.target.value)}
          required
        />


        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Login
        </button>

      </form>

    </div>

  );

}