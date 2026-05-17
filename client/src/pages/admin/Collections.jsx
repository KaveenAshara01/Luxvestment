import React, { useState, useEffect } from 'react';
import './AdminSubPages.css';

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCollections();
    }, []);

    const getAuthHeaders = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.token : '';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    const loadCollections = async () => {
        try {
            const res = await fetch('/api/collections', { headers: getAuthHeaders() });
            const data = await res.json();
            if (Array.isArray(data)) setCollections(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `/api/collections/${currentId}` : '/api/collections';
            
            await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            
            loadCollections();
            resetForm();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleEdit = (collection) => {
        setIsEditing(true);
        setCurrentId(collection._id);
        setFormData({ name: collection.name, description: collection.description || '' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this collection?')) {
            try {
                await fetch(`/api/collections/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                loadCollections();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ name: '', description: '' });
    };

    return (
        <div className="admin-subpage">
            <h2>Collections Management</h2>
            
            <form className="admin-form" onSubmit={handleSubmit}>
                <h3>{isEditing ? 'Edit Collection' : 'Add New Collection'}</h3>
                <div className="form-group">
                    <label>Collection Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading} className="premium-btn">
                        {loading ? 'Processing...' : (isEditing ? 'Update Collection' : 'Add Collection')}
                    </button>
                    {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>}
                </div>
            </form>

            <div className="admin-list">
                <h3>Current Collections</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map(col => (
                                <tr key={col._id}>
                                    <td>{col.name}</td>
                                    <td>{col.description}</td>
                                    <td>
                                        <button onClick={() => handleEdit(col)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(col._id)} className="delete-btn">Delete</button>
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

export default Collections;
