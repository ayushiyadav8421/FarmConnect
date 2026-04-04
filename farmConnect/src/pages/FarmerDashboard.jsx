import { useState, useEffect } from "react";

export default function FarmerDashboard() {

  const role = localStorage.getItem("role");
  if (role !== "farmer") {
    return <h1 className="p-10">Access denied</h1>;
  }
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const farmer_email = localStorage.getItem("user");


  // load farmer products
  const loadProducts = () => {

    fetch(`http://127.0.0.1:5000/farmer-products/${farmer_email}`)
      .then(res => res.json())
      .then(data => setProducts(data));

  };

  useEffect(() => {
    loadProducts();
  }, []);


  // add product
  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("farmer_email", farmer_email);
    formData.append("image", image);

    const res = await fetch(
      "http://127.0.0.1:5000/add-product",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    alert(data.message);

    loadProducts();

  };


  // delete product
  const deleteProduct = async (id) => {

    await fetch(
      `http://127.0.0.1:5000/delete-product/${id}`,
      { method: "DELETE" }
    );

    alert("Deleted");

    loadProducts();

  };


  // open edit modal
  const openEdit = (product) => {

    setEditId(product.id);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditPrice(product.price);

    setShowModal(true);

  };


  // update product
  const updateProduct = async () => {

    const formData = new FormData();

    formData.append("name", editName);
    formData.append("category", editCategory);
    formData.append("price", editPrice);

    await fetch(
      `http://127.0.0.1:5000/update-product/${editId}`,
      {
        method: "PUT",
        body: formData
      }
    );

    alert("Updated");

    setShowModal(false);

    loadProducts();

  };


  return (

    <div className="p-10 bg-gray-100 min-h-screen">

      {/* ADD PRODUCT FORM */}

      <div className="flex justify-center mb-10">

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow p-6 w-96"
        >

          <h2 className="text-xl mb-4">
            Add Product
          </h2>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Product name"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Price"
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <select
            className="border p-2 w-full mb-2"
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="grains">Grains</option>
            <option value="herbs">Herbs</option>
            <option value="organic">Organic</option>

          </select>

          <input
            type="file"
            className="mb-4"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />

          <button
            className="bg-green-600 text-white w-full p-2"
          >
            Add Product
          </button>

        </form>

      </div>


      {/* PRODUCT LIST */}

      <h2 className="text-2xl font-bold mb-4">
        Your Products
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {products.map(product => (

          <div
            key={product.id}
            className="bg-white shadow rounded p-4"
          >

            <img
              src={`http://127.0.0.1:5000/images/${product.image}`}
              className="w-full h-40 object-cover rounded"
            />

            <h3 className="text-xl font-bold mt-2">
              {product.name}
            </h3>

            <p>{product.category}</p>

            <p className="font-bold">
              ₹{product.price}
            </p>

            <button
              onClick={() => openEdit(product)}
              className="bg-blue-500 text-white px-4 py-2 mt-2 mr-2 rounded"
            >
              Edit
            </button>

            <button
              onClick={() => deleteProduct(product.id)}
              className="bg-red-500 text-white px-4 py-2 mt-2 rounded"
            >
              Delete
            </button>

          </div>

        ))}

      </div>


      {/* EDIT MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

          <div className="bg-white p-6 w-96 rounded shadow">

            <h2 className="text-xl mb-4">
              Edit Product
            </h2>

            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <input
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="border p-2 w-full mb-2"
            />

            <input
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="border p-2 w-full mb-4"
            />

            <button
              onClick={updateProduct}
              className="bg-green-600 text-white px-4 py-2 mr-2 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>

  );

}