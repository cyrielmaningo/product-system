import React, { useState, useEffect } from 'react';
import './App.css';

interface Product {
    _id?: string;
    product_code: string;
    name: string;
    description: string;
    price: string;
    qty: string;
    date_added: string;
    isDeleted?: boolean;
}

const App = () => {
    const [product, setProduct] = useState<Product>({
        product_code: '',
        name: '',
        description: '',
        price: '',
        qty: '',
        date_added: '',
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editProductId, setEditProductId] = useState<string | null>(null);
    const [showDeleted, setShowDeleted] = useState<boolean>(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchDeletedProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/products/deleted');
            const data = await response.json();
            setDeletedProducts(data);
        } catch (error) {
            console.error('Error fetching deleted products:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `http://localhost:5000/products/${editProductId}`
                : 'http://localhost:5000/products';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            alert(isEditing ? 'Product updated successfully!' : 'Product saved successfully!');
            fetchProducts();
            handleClear();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. See console for more details.');
        }
    };

    const handleEdit = (product: Product) => {
        setProduct(product);
        setIsEditing(true);
        setEditProductId(product._id || null);
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/products/${id}`, { method: 'DELETE' });
            alert('Product deleted successfully! If you want to restore the Product Please click Show Deleted Product below!');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product.');
        }
    };

    const handleClear = () => {
        setProduct({ product_code: '', name: '', description: '', price: '', qty: '', date_added: '' });
        setIsEditing(false);
        setEditProductId(null);
    };

    const handleToggleDeleted = async () => {
        setShowDeleted((prev) => !prev);
        if (!showDeleted) {
            await fetchDeletedProducts();
        }
    };

    const handleRestoreProduct = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/products/restore/${id}`, { method: 'PUT' });
            alert('Product restored successfully!');
            fetchProducts();
            handleToggleDeleted();
        } catch (error) {
            console.error('Error restoring product:', error);
            alert('Failed to restore product.');
        }
    };

    const handlePermanentlyDelete = async (id: string) => {
        const confirmDelete = window.confirm('Are you sure you want to permanently delete this product? This product cannot be retrieved once you click OK');
        if (!confirmDelete) {
            return; // Exit if the user cancels
        }

        try {
            await fetch(`http://localhost:5000/products/permanently/${id}`, { method: 'DELETE' });
            alert('Product permanently deleted successfully!');
            fetchDeletedProducts(); // Refresh the deleted products list
        } catch (error) {
            console.error('Error permanently deleting product:', error);
            alert('Failed to permanently delete product.');
        }
    };

    return (
        <div className="app-wrapper">
            <h1 className="main-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
            <form className="product-form">
                <div className="form-group">
                    <label>Product Code:</label>
                    <input
                        type="text"
                        name="product_code"
                        value={product.product_code}
                        onChange={handleChange}
                        required
                        placeholder="Input product code"
                    />
                </div>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                        placeholder="What's the name of your product?"
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <input
                        type="text"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                        placeholder="Describe your product"
                    />
                </div>
                <div className="form-group">
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                        placeholder="How much is your product? (Numbers only)"
                    />
                </div>
                <div className="form-group">
                    <label>Quantity:</label>
                    <input
                        type="number"
                        name="qty"
                        value={product.qty}
                        onChange={handleChange}
                        required
                        placeholder="How many quantities of your product? (Numbers only)"
                    />
                </div>
                <div className="form-group">
                    <label>Date Added:</label>
                    <input
                        type="date"
                        name="date_added"
                        value={product.date_added}
                        onChange={handleChange}
                        required
                        placeholder="Input Date Added"
                    />
                </div>
                <div className="button-container">
                    <button type="button" onClick={handleSave} className="save-button">
                        {isEditing ? 'Update' : 'Save'}
                    </button>
                    <button type="button" onClick={handleClear} className="clear-button">Clear</button>
                </div>
            </form>

            <h2 className="section-heading">Active Products</h2>
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Product Code</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr className="product-item" key={p._id}>
                            <td>{p.product_code}</td>
                            <td>{p.name}</td>
                            <td>${p.price}</td>
                            <td>
                                <button className="edit-button" onClick={() => handleEdit(p)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDelete(p._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="toggle-deleted-button" onClick={handleToggleDeleted}>
                {showDeleted ? 'Hide Deleted Products' : 'Show Deleted Products'}
            </button>

            {showDeleted && (
                <div>
                    <h2 className="section-heading">Deleted Products</h2>
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Product Code</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletedProducts.map((p) => (
                                <tr className="product-item" key={p._id}>
                                    <td>{p.product_code}</td>
                                    <td>{p.name}</td>
                                    <td>${p.price}</td>
                                    <td>
                                        <button className="restore-button" onClick={() => handleRestoreProduct(p._id)}>Restore</button>
                                        <button className="delete-button" onClick={() => handlePermanentlyDelete(p._id)}>Permanently Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default App;
