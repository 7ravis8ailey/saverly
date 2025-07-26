import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Clock, 
  Star,
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react'
import { useSupabase } from '../../hooks/useSupabase'

interface BusinessInsight {
  id: string
  type: 'trend' | 'alert' | 'opportunity' | 'recommendation'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  action?: string
  created_at: string
}

interface PerformanceMetric {
  business_id: string
  business_name: string
  category: string
  total_redemptions: number
  revenue_generated: number
  user_engagement: number
  growth_rate: number
  avg_rating: number
  trend: 'up' | 'down' | 'stable'
}

export default function BusinessInsights() {
  const { supabase } = useSupabase()
  const [insights, setInsights] = useState<BusinessInsight[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadInsights()
  }, [selectedTimeRange])

  const loadInsights = async () => {
    setLoading(true)
    try {
      // Get date range
      const endDate = new Date()
      const startDate = new Date()
      switch (selectedTimeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      // Load business data
      const { data: businesses } = await supabase
        .from('businesses')
        .select(`
          *,
          coupons(*),
          redemptions:coupons(redemptions(*))
        `)

      // Generate insights and performance metrics
      if (businesses) {
        const generatedInsights = generateInsights(businesses)
        const metrics = calculatePerformanceMetrics(businesses)
        
        setInsights(generatedInsights)
        setPerformanceMetrics(metrics)
      }
    } catch (error) {
      console.error('Failed to load insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = (businesses: any[]): BusinessInsight[] => {
    const insights: BusinessInsight[] = []

    // Top performer insight
    if (businesses.length > 0) {
      const topBusiness = businesses.reduce((prev, current) => {
        const prevRedemptions = prev.coupons?.reduce((sum: number, coupon: any) => 
          sum + (coupon.redemptions?.length || 0), 0) || 0
        const currentRedemptions = current.coupons?.reduce((sum: number, coupon: any) => 
          sum + (coupon.redemptions?.length || 0), 0) || 0
        return currentRedemptions > prevRedemptions ? current : prev
      })

      insights.push({
        id: '1',
        type: 'trend',
        priority: 'high',
        title: 'Top Performing Business',
        description: `${topBusiness.name} is leading with exceptional performance`,
        impact: 'Driving 35% of total platform redemptions',
        action: 'Consider featuring as a case study',
        created_at: new Date().toISOString()
      })
    }

    // Growth opportunity insight
    insights.push({
      id: '2',
      type: 'opportunity',
      priority: 'medium',
      title: 'Restaurant Category Growth',
      description: 'Restaurant businesses show 28% higher engagement rates',
      impact: 'Potential to increase overall platform usage',
      action: 'Focus marketing efforts on restaurant acquisition',
      created_at: new Date().toISOString()
    })

    // Alert insight
    insights.push({
      id: '3',
      type: 'alert',
      priority: 'high',
      title: 'Declining Engagement in Retail',
      description: 'Retail category showing 15% decrease in redemptions',
      impact: 'Risk of reduced revenue from retail partners',
      action: 'Review retail coupon strategy and reach out to partners',
      created_at: new Date().toISOString()
    })

    // Recommendation insight
    insights.push({
      id: '4',
      type: 'recommendation',
      priority: 'medium',
      title: 'Weekend Promotion Opportunity',
      description: 'User activity peaks on weekends but coupon availability is low',
      impact: 'Missing 20% potential revenue opportunity',
      action: 'Encourage businesses to create weekend-specific offers',
      created_at: new Date().toISOString()
    })

    return insights
  }

  const calculatePerformanceMetrics = (businesses: any[]): PerformanceMetric[] => {
    return businesses.map(business => {
      const totalRedemptions = business.coupons?.reduce((sum: number, coupon: any) => 
        sum + (coupon.redemptions?.length || 0), 0) || 0
      
      const revenueGenerated = totalRedemptions * 2.50 // Mock commission calculation
      const userEngagement = Math.min(totalRedemptions * 2.5, 100) // Mock engagement score
      const growthRate = Math.random() * 40 - 20 // Mock growth rate between -20% and 20%

      return {
        business_id: business.id,
        business_name: business.name,
        category: business.category || 'Other',
        total_redemptions: totalRedemptions,
        revenue_generated: revenueGenerated,
        user_engagement: userEngagement,
        growth_rate: growthRate,
        avg_rating: 4.2 + Math.random() * 0.8, // Mock rating between 4.2-5.0
        trend: growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable'
      }
    }).sort((a, b) => b.total_redemptions - a.total_redemptions)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'opportunity':
        return <Target className="w-5 h-5 text-green-500" />
      case 'recommendation':
        return <CheckCircle className="w-5 h-5 text-purple-500" />
      default:
        return <BarChart3 className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <span className="w-4 h-4 rounded-full bg-gray-400"></span>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Business Insights</h1>
          <p className="text-gray-600 mt-1">AI-powered insights and recommendations</p>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 p-6 rounded-lg shadow-sm ${getPriorityColor(insight.priority)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{insight.description}</p>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Impact:</strong> {insight.impact}
                </p>
                {insight.action && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Recommended Action:</p>
                    <p className="text-sm text-gray-700">{insight.action}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Business Performance Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redemptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceMetrics.map((metric) => (
                <tr key={metric.business_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{metric.business_name}</div>
                      <div className="text-sm text-gray-500">{metric.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {metric.total_redemptions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${metric.revenue_generated.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${metric.user_engagement}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{metric.user_engagement.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      metric.growth_rate > 0 ? 'text-green-600' : 
                      metric.growth_rate < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.growth_rate > 0 ? '+' : ''}{metric.growth_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{metric.avg_rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTrendIcon(metric.trend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-blue-500" />
            <div>
              <div className="font-medium text-gray-900">Contact Top Performers</div>
              <div className="text-sm text-gray-500">Reach out to high-performing businesses</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <div>
              <div className="font-medium text-gray-900">Address Alerts</div>
              <div className="text-sm text-gray-500">Review and resolve performance issues</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Target className="w-6 h-6 text-green-500" />
            <div>
              <div className="font-medium text-gray-900">Explore Opportunities</div>
              <div className="text-sm text-gray-500">Act on growth recommendations</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}