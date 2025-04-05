import React, { useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const AddProduct = () => {
    const [product, setProduct] = useState({
        name: "", description: "", category: "", subCategory: "", price: "", sizes: "", bestseller: false, images: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleFileChange = (e) => {
        setProduct({ ...product, images: e.target.files });
    };

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.keys(product).forEach((key) => {
            if (key === "images") {
                for (let i = 0; i < product.images.length; i++) {
                    formData.append("images", product.images[i]);
                }
            } else if (key === "sizes") {
                formData.append("sizes", JSON.stringify(product.sizes.split(",")));
            } else {
                formData.append(key, product[key]);
            }
        });

        try {
            await axios.post(`${API_URL}/api/products/add`, formData);
            alert("Product Added Successfully!");
            setProduct({ name: "", description: "", category: "", subCategory: "", price: "", sizes: "", bestseller: false, images: [] });
        } catch (error) {
            console.error("Error adding product", error);
        }
    };

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-4">Add Product</h1>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                    <input type="text" name="name" placeholder="Product Name" value={product.name} onChange={handleChange} className="w-full border p-2 mb-2" required />
                    <textarea name="description" placeholder="Description" value={product.description} onChange={handleChange} className="w-full border p-2 mb-2" required />
                    <input type="text" name="category" placeholder="Category" value={product.category} onChange={handleChange} className="w-full border p-2 mb-2" required />
                    <input type="text" name="subCategory" placeholder="Subcategory" value={product.subCategory} onChange={handleChange} className="w-full border p-2 mb-2" />
                    <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} className="w-full border p-2 mb-2" required />
                    <input type="text" name="sizes" placeholder="Sizes (comma separated)" value={product.sizes} onChange={handleChange} className="w-full border p-2 mb-2" />
                    <input type="file" multiple onChange={handleFileChange} className="w-full border p-2 mb-2" />
                    <button type="submit" className="bg-red-600 text-white p-2 w-full rounded hover:bg-green-700">Add Product</button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
