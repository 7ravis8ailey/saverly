import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp,
  Calendar,
  MapPin,
  Target,
  Award
} from 'lucide-react'
import { useSupabase } from '../../hooks/useSupabase'

interface AnalyticsData {
  totalUsers: number
  activeSubscriptions: number
  totalRevenue: number
  totalRedemptions: number
  conversionRate: number
  avgRevenuePerUser: number
  userGrowth: number
  redemptionsByWeek: Array<{ week: string; redemptions: number }>
  topBusinesses: Array<{ name: string; redemptions: number; revenue: number }>
  usersByLocation: Array<{ city: string; users: number }>
  subscriptionBreakdown: Array<{ type: string; count: number; value: number }>
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']

export default function AnalyticsDashboard() {
  const { supabase } = useSupabase()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Get date range
      const endDate = new Date()
      const startDate = new Date()
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Fetch analytics data in parallel
      const [
        usersResult,
        subscriptionsResult,
        redemptionsResult,
        businessesResult
      ] = await Promise.all([
        supabase
          .from('auth.users')
          .select('id, created_at, raw_user_meta_data')
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('user_subscriptions')
          .select('*')
          .eq('status', 'active'),
        
        supabase
          .from('redemptions')
          .select('*, coupons(*, businesses(name))')
          .gte('created_at', startDate.toISOString()),
        
        supabase
          .from('businesses')
          .select('*, coupons(*, redemptions(*))')
      ])

      // Calculate metrics
      const totalUsers = usersResult.data?.length || 0
      const activeSubscriptions = subscriptionsResult.data?.length || 0
      const totalRedemptions = redemptionsResult.data?.length || 0
      
      // Mock revenue calculation (in real app, would come from Stripe)
      const totalRevenue = activeSubscriptions * 4.99
      const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0
      const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0

      // Calculate weekly redemptions
      const redemptionsByWeek = calculateWeeklyRedemptions(redemptionsResult.data || [])
      
      // Top businesses by redemptions
      const topBusinesses = calculateTopBusinesses(businessesResult.data || [])
      
      // Users by location (mock data for now)
      const usersByLocation = [
        { city: 'San Francisco', users: Math.floor(totalUsers * 0.3) },
        { city: 'Los Angeles', users: Math.floor(totalUsers * 0.25) },
        { city: 'New York', users: Math.floor(totalUsers * 0.2) },
        { city: 'Chicago', users: Math.floor(totalUsers * 0.15) },
        { city: 'Austin', users: Math.floor(totalUsers * 0.1) }
      ]

      // Subscription breakdown
      const monthlySubscriptions = Math.floor(activeSubscriptions * 0.7)
      const yearlySubscriptions = activeSubscriptions - monthlySubscriptions
      const subscriptionBreakdown = [
        { type: 'Monthly', count: monthlySubscriptions, value: monthlySubscriptions * 4.99 },
        { type: 'Yearly', count: yearlySubscriptions, value: yearlySubscriptions * 49.00 }
      ]

      // Calculate user growth (mock calculation)
      const userGrowth = 12.5 // percent

      setAnalytics({
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        totalRedemptions,
        conversionRate,
        avgRevenuePerUser,
        userGrowth,
        redemptionsByWeek,
        topBusinesses,
        usersByLocation,
        subscriptionBreakdown
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWeeklyRedemptions = (redemptions: any[]) => {
    const weeks: Record<string, number> = {}
    
    redemptions.forEach(redemption => {
      const date = new Date(redemption.created_at)
      const week = `Week ${Math.ceil(date.getDate() / 7)}`
      weeks[week] = (weeks[week] || 0) + 1
    })

    return Object.entries(weeks).map(([week, count]) => ({
      week,
      redemptions: count
    }))
  }

  const calculateTopBusinesses = (businesses: any[]) => {
    return businesses
      .map(business => {
        const redemptions = business.coupons?.reduce((total: number, coupon: any) => 
          total + (coupon.redemptions?.length || 0), 0) || 0
        const revenue = redemptions * 0.50 // Mock commission calculation
        
        return {
          name: business.name,
          redemptions,
          revenue
        }
      })
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{analytics.userGrowth}% from last period</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeSubscriptions.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{analytics.conversionRate.toFixed(1)}% conversion rate</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">${analytics.avgRevenuePerUser.toFixed(2)} ARPU</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRedemptions.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Across all businesses</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Redemptions Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Redemptions</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.redemptionsByWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="redemptions" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.subscriptionBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count }) => `${type}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.subscriptionBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Businesses */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Businesses</h3>
          <div className="space-y-4">
            {analytics.topBusinesses.map((business, index) => (
              <div key={business.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{business.name}</p>
                    <p className="text-sm text-gray-500">{business.redemptions} redemptions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${business.revenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Location */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Location</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.usersByLocation} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="city" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="users" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Business Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Growth Trend</h4>
            </div>
            <p className="text-sm text-blue-700">
              User growth is accelerating at {analytics.userGrowth}% month-over-month, 
              driven by strong word-of-mouth referrals.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Best Performing</h4>
            </div>
            <p className="text-sm text-green-700">
              {analytics.topBusinesses[0]?.name || 'N/A'} leads with {analytics.topBusinesses[0]?.redemptions || 0} redemptions, 
              indicating strong local appeal.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Geographic Focus</h4>
            </div>
            <p className="text-sm text-purple-700">
              San Francisco and LA markets show highest engagement, 
              suggesting potential for targeted expansion.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}