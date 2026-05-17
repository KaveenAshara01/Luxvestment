import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-wysiwyg';
import { fetchProducts, createProduct, deleteProduct, updateProduct } from '../../utils/api';
import './AdminSubPages.css';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', price: '', currency: 'LKR', stock: 1, collectionId: ''
    });
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
        loadCollections();
    }, []);

    const loadProducts = async () => {
        const data = await fetchProducts();
        if (Array.isArray(data)) setProducts(data);
    };

    const loadCollections = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user ? user.token : '';
            const res = await fetch('/api/collections', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setCollections(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('description', description);
        Array.from(images).forEach(img => data.append('images', img));

        try {
            if (isEditing) {
                await updateProduct(currentId, data);
            } else {
                await createProduct(data);
            }
            loadProducts();
            resetForm();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setCurrentId(product._id);
        setFormData({
            name: product.name, price: product.price, currency: product.currency || 'LKR', stock: product.stock, 
            collectionId: product.collectionId?._id || ''
        });
        setDescription(product.description || '');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this product?')) {
            await deleteProduct(id);
            loadProducts();
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ name: '', price: '', currency: 'LKR', stock: 1, collectionId: '' });
        setDescription('');
        setImages([]);
    };

    return (
        <div className="admin-subpage">
            <h2>Inventory Management</h2>
            
            <form className="admin-form" onSubmit={handleSubmit}>
                <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Price</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <select name="currency" value={formData.currency} onChange={handleInputChange} style={{width: 'auto'}}>
                                <option value="LKR">LKR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="AUD">AUD</option>
                                <option value="CAD">CAD</option>
                            </select>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Stock Count</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Collection (Optional)</label>
                        <select name="collectionId" value={formData.collectionId} onChange={handleInputChange}>
                            <option value="">None</option>
                            {collections.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Description</label>
                    <Editor value={description} onChange={(e) => setDescription(e.target.value)} style={{ height: '200px', marginBottom: '40px' }} />
                </div>
                
                <div className="form-group">
                    <label>Images (Upload multiple)</label>
                    <input type="file" multiple onChange={handleImageChange} />
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="premium-btn">
                        {loading ? 'Processing...' : (isEditing ? 'Update Product' : 'Add Product')}
                    </button>
                    {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>}
                </div>
            </form>

            <div className="admin-list">
                <h3>Current Inventory</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Collection</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>{product.name}</td>
                                    <td>{product.price ? product.price.toLocaleString() : '0'} {product.currency || 'LKR'}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.collectionId ? product.collectionId.name : '-'}</td>
                                    <td>
                                        <button onClick={() => handleEdit(product)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(product._id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
