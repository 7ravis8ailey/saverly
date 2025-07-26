import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Business } from '../lib/supabase'
import { businessSchema } from '../lib/validation'
import { SecureBusinessService } from '../services/secureBusinessService'
import { sanitizeError, logError } from '../lib/errors'

interface SecureBusinessFormProps {
  business?: Business
  onSave: (business: Business) => void
  onCancel: () => void
}

export function SecureBusinessForm({ business, onSave, onCancel }: SecureBusinessFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || '',
      description: business?.description || '',
      category: business?.category || 'Food & Beverage',
      address: business?.address || '',
      city: business?.city || '',
      state: business?.state || 'TN',
      zip_code: business?.zip_code || '',
      phone: business?.phone || '',
      email: business?.email || '',
      contact_name: business?.contact_name || '',
      latitude: business?.latitude || 0,
      longitude: business?.longitude || 0,
      active: business?.active ?? true
    }
  })

  const categories = [
    'Food & Beverage',
    'Retail',
    'Health & Wellness',
    'Entertainment & Recreation',
    'Personal Services'
  ]

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')

    try {
      let savedBusiness: Business
      if (business?.id) {
        savedBusiness = await SecureBusinessService.updateBusiness(business.id, data)
      } else {
        savedBusiness = await SecureBusinessService.createBusiness(data)
      }
      onSave(savedBusiness)
    } catch (err) {
      const errorMessage = sanitizeError(err)
      setError(errorMessage)
      logError(err, { operation: 'businessForm', data, businessId: business?.id })
    } finally {
      setLoading(false)
    }
  }

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`
    }
    setValue('phone', value)
  }

  // Geocoding helper (placeholder - in production, integrate with Google Maps API)
  const handleAddressLookup = async () => {
    const address = watch('address')
    const city = watch('city')
    const state = watch('state')
    
    if (!address || !city || !state) {
      setError('Please fill in address, city, and state for location lookup')
      return
    }

    // In production, implement geocoding API call
    // For now, set default coordinates for Tennessee
    setValue('latitude', 36.1627)
    setValue('longitude', -86.7816)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="business-form secure-form">
      <h2>{business ? 'Edit Business' : 'Add New Business'}</h2>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="name">Business Name *</label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className={errors.name ? 'error' : ''}
          aria-describedby={errors.name ? 'name-error' : undefined}
          disabled={loading}
          maxLength={100}
        />
        {errors.name && (
          <div id="name-error" className="field-error" role="alert">
            {errors.name.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          {...register('description')}
          id="description"
          className={errors.description ? 'error' : ''}
          aria-describedby={errors.description ? 'description-error' : undefined}
          disabled={loading}
          maxLength={500}
          rows={3}
        />
        {errors.description && (
          <div id="description-error" className="field-error" role="alert">
            {errors.description.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category *</label>
        <select
          {...register('category')}
          id="category"
          className={errors.category ? 'error' : ''}
          aria-describedby={errors.category ? 'category-error' : undefined}
          disabled={loading}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && (
          <div id="category-error" className="field-error" role="alert">
            {errors.category.message}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact_name">Contact Name *</label>
          <input
            {...register('contact_name')}
            type="text"
            id="contact_name"
            className={errors.contact_name ? 'error' : ''}
            aria-describedby={errors.contact_name ? 'contact-name-error' : undefined}
            disabled={loading}
            maxLength={100}
          />
          {errors.contact_name && (
            <div id="contact-name-error" className="field-error" role="alert">
              {errors.contact_name.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={errors.email ? 'error' : ''}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={loading}
            maxLength={100}
            autoComplete="email"
          />
          {errors.email && (
            <div id="email-error" className="field-error" role="alert">
              {errors.email.message}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className={errors.phone ? 'error' : ''}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          disabled={loading}
          placeholder="(123) 456-7890"
          onChange={handlePhoneChange}
          autoComplete="tel"
        />
        {errors.phone && (
          <div id="phone-error" className="field-error" role="alert">
            {errors.phone.message}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address">Address *</label>
        <div className="address-input-group">
          <input
            {...register('address')}
            type="text"
            id="address"
            className={errors.address ? 'error' : ''}
            aria-describedby={errors.address ? 'address-error' : undefined}
            disabled={loading}
            maxLength={200}
            autoComplete="street-address"
          />
          <button
            type="button"
            onClick={handleAddressLookup}
            className="btn-secondary"
            disabled={loading}
            title="Look up coordinates"
          >
            📍
          </button>
        </div>
        {errors.address && (
          <div id="address-error" className="field-error" role="alert">
            {errors.address.message}
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            {...register('city')}
            type="text"
            id="city"
            className={errors.city ? 'error' : ''}
            aria-describedby={errors.city ? 'city-error' : undefined}
            disabled={loading}
            maxLength={100}
            autoComplete="address-level2"
          />
          {errors.city && (
            <div id="city-error" className="field-error" role="alert">
              {errors.city.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            {...register('state')}
            type="text"
            id="state"
            className={errors.state ? 'error' : ''}
            aria-describedby={errors.state ? 'state-error' : undefined}
            disabled={loading}
            maxLength={50}
            autoComplete="address-level1"
            defaultValue="TN"
          />
          {errors.state && (
            <div id="state-error" className="field-error" role="alert">
              {errors.state.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="zip_code">ZIP Code *</label>
          <input
            {...register('zip_code')}
            type="text"
            id="zip_code"
            className={errors.zip_code ? 'error' : ''}
            aria-describedby={errors.zip_code ? 'zip-error' : undefined}
            disabled={loading}
            pattern="[0-9]{5}(-[0-9]{4})?"
            placeholder="12345"
            autoComplete="postal-code"
          />
          {errors.zip_code && (
            <div id="zip-error" className="field-error" role="alert">
              {errors.zip_code.message}
            </div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="latitude">Latitude *</label>
          <input
            {...register('latitude', { valueAsNumber: true })}
            type="number"
            id="latitude"
            className={errors.latitude ? 'error' : ''}
            aria-describedby={errors.latitude ? 'latitude-error' : undefined}
            disabled={loading}
            step="0.000001"
            min="-90"
            max="90"
          />
          {errors.latitude && (
            <div id="latitude-error" className="field-error" role="alert">
              {errors.latitude.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude *</label>
          <input
            {...register('longitude', { valueAsNumber: true })}
            type="number"
            id="longitude"
            className={errors.longitude ? 'error' : ''}
            aria-describedby={errors.longitude ? 'longitude-error' : undefined}
            disabled={loading}
            step="0.000001"
            min="-180"
            max="180"
          />
          {errors.longitude && (
            <div id="longitude-error" className="field-error" role="alert">
              {errors.longitude.message}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            {...register('active')}
            type="checkbox"
            disabled={loading}
          />
          <span className="checkmark"></span>
          Active
        </label>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (business ? 'Updating...' : 'Creating...') : (business ? 'Update Business' : 'Create Business')}
        </button>
      </div>
    </form>
  )
}