import { useState, useEffect } from 'react'
import type { Business } from '../lib/supabase'
import { BusinessService } from '../services/businessService'
import { BusinessForm } from './BusinessForm'

export function BusinessList() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = [
    'Food & Beverage',
    'Retail',
    'Health & Wellness',
    'Entertainment & Recreation',
    'Personal Services'
  ]

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      const data = await BusinessService.getBusinesses()
      setBusinesses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (business: Business) => {
    if (editingBusiness) {
      setBusinesses(prev => prev.map(b => b.id === business.id ? business : b))
    } else {
      setBusinesses(prev => [...prev, business])
    }
    setShowForm(false)
    setEditingBusiness(undefined)
  }

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    setShowForm(true)
  }

  const handleDelete = async (business: Business) => {
    if (!confirm(`Are you sure you want to delete ${business.name}?`)) return

    try {
      await BusinessService.deleteBusiness(business.id)
      setBusinesses(prev => prev.filter(b => b.id !== business.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete business')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBusiness(undefined)
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || business.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (showForm) {
    return (
      <BusinessForm
        business={editingBusiness}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="business-list">
      <div className="list-header">
        <h1>Business Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add New Business
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading businesses...</div>
      ) : (
        <div className="business-grid">
          {filteredBusinesses.map(business => (
            <div key={business.id} className="business-card">
              <div className="business-header">
                <h3>{business.name}</h3>
                <span className={`status ${business.active ? 'active' : 'inactive'}`}>
                  {business.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="business-info">
                <p className="category">{business.category}</p>
                <p className="contact">{business.contact_name}</p>
                <p className="email">{business.email}</p>
                <p className="location">
                  {business.city}, {business.state} {business.zip_code}
                </p>
                {business.phone && <p className="phone">{business.phone}</p>}
              </div>

              {business.description && (
                <p className="description">{business.description}</p>
              )}

              <div className="business-actions">
                <button onClick={() => handleEdit(business)} className="btn-edit">
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(business)} 
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredBusinesses.length === 0 && (
        <div className="empty-state">
          <p>No businesses found matching your criteria.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Business
          </button>
        </div>
      )}
    </div>
  )
}