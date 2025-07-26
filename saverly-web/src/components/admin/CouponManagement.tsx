import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react'
import { useSupabase } from '../../hooks/useSupabase'

interface Coupon {
  id: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  business_id: string
  business?: {
    name: string
    category: string
  }
  valid_from: string
  valid_until: string
  max_uses: number | null
  current_uses: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CouponFilters {
  search: string
  business: string
  status: 'all' | 'active' | 'inactive' | 'expired'
  category: string
}

export default function CouponManagement() {
  const { supabase } = useSupabase()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string; category: string }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [filters, setFilters] = useState<CouponFilters>({
    search: '',
    business: '',
    status: 'all',
    category: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [couponsResult, businessesResult] = await Promise.all([
        supabase
          .from('coupons')
          .select(`
            *,
            business:businesses(name, category),
            redemptions(id)
          `)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('businesses')
          .select('id, name, category')
          .order('name')
      ])

      if (couponsResult.data) {
        const processedCoupons = couponsResult.data.map(coupon => ({
          ...coupon,
          current_uses: coupon.redemptions?.length || 0
        }))
        setCoupons(processedCoupons)
      }

      if (businessesResult.data) {
        setBusinesses(businessesResult.data)
      }
    } catch (error) {
      console.error('Failed to load coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCoupons = coupons.filter(coupon => {
    // Search filter
    if (filters.search && !coupon.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !coupon.business?.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Business filter
    if (filters.business && coupon.business_id !== filters.business) {
      return false
    }

    // Category filter
    if (filters.category && coupon.business?.category !== filters.category) {
      return false
    }

    // Status filter
    if (filters.status !== 'all') {
      const now = new Date()
      const validUntil = new Date(coupon.valid_until)
      const isExpired = validUntil < now
      
      switch (filters.status) {
        case 'active':
          return coupon.is_active && !isExpired
        case 'inactive':
          return !coupon.is_active
        case 'expired':
          return isExpired
      }
    }

    return true
  })

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedCoupons.length === 0) return

    try {
      switch (action) {
        case 'activate':
        case 'deactivate':
          await supabase
            .from('coupons')
            .update({ is_active: action === 'activate' })
            .in('id', selectedCoupons)
          break
        
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedCoupons.length} coupons?`)) {
            await supabase
              .from('coupons')
              .delete()
              .in('id', selectedCoupons)
          }
          break
      }

      setSelectedCoupons([])
      loadData()
    } catch (error) {
      console.error(`Failed to ${action} coupons:`, error)
    }
  }

  const getStatusIcon = (coupon: Coupon) => {
    const now = new Date()
    const validUntil = new Date(coupon.valid_until)
    const isExpired = validUntil < now

    if (isExpired) {
      return <XCircle className="w-4 h-4 text-red-500" />
    } else if (coupon.is_active) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else {
      return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (coupon: Coupon) => {
    const now = new Date()
    const validUntil = new Date(coupon.valid_until)
    const isExpired = validUntil < now

    if (isExpired) return 'Expired'
    return coupon.is_active ? 'Active' : 'Inactive'
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% off`
    } else {
      return `$${coupon.discount_value} off`
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all business coupons</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons or businesses..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={filters.business}
            onChange={(e) => setFilters(prev => ({ ...prev, business: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Businesses</option>
            {businesses.map(business => (
              <option key={business.id} value={business.id}>{business.name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Retail">Retail</option>
            <option value="Service">Service</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCoupons.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedCoupons.length} coupon{selectedCoupons.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="text-green-600 hover:text-green-800 px-3 py-1 text-sm font-medium"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="text-orange-600 hover:text-orange-800 px-3 py-1 text-sm font-medium"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCoupons.length === filteredCoupons.length && filteredCoupons.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCoupons(filteredCoupons.map(c => c.id))
                      } else {
                        setSelectedCoupons([])
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coupon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCoupons.includes(coupon.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCoupons(prev => [...prev, coupon.id])
                        } else {
                          setSelectedCoupons(prev => prev.filter(id => id !== coupon.id))
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{coupon.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{coupon.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{coupon.business?.name}</div>
                      <div className="text-sm text-gray-500">{coupon.business?.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {formatDiscount(coupon)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {coupon.current_uses} / {coupon.max_uses || '∞'}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: coupon.max_uses 
                            ? `${Math.min((coupon.current_uses / coupon.max_uses) * 100, 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(coupon.valid_until).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(coupon)}
                      <span className="text-sm text-gray-900">{getStatusText(coupon)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCoupon(coupon)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="More Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Copy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter(c => c.is_active && new Date(c.valid_until) > new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.reduce((sum, c) => sum + c.current_uses, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Expired Coupons</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter(c => new Date(c.valid_until) < new Date()).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}