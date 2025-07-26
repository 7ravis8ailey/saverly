import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  HeartIcon, 
  UserIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as SearchSolid,
  HeartIcon as HeartSolid,
  UserIcon as UserSolid,
  CreditCardIcon as CreditSolid
} from '@heroicons/react/24/solid'
import SubscriptionModal from './SubscriptionModal'
import { useAuth } from '../../hooks/useAuth'

export function MobileNavigation() {
  const location = useLocation()
  const { user } = useAuth()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  
  // Check if user has active subscription
  const hasSubscription = user?.subscription_status === 'active'

  // Different navigation for subscribers vs non-subscribers
  const navItems = hasSubscription ? [
    {
      path: '/app',
      label: 'Deals',
      icon: HomeIcon,
      activeIcon: HomeSolid
    },
    {
      path: '/app/search',
      label: 'Search',  
      icon: MagnifyingGlassIcon,
      activeIcon: SearchSolid
    },
    {
      path: '/app/favorites',
      label: 'Favorites',
      icon: HeartIcon,
      activeIcon: HeartSolid
    },
    {
      path: '/app/profile',
      label: 'Profile',
      icon: UserIcon,
      activeIcon: UserSolid
    }
  ] : [
    {
      path: '/app/about',
      label: 'About',
      icon: HomeIcon,
      activeIcon: HomeSolid
    },
    {
      path: '/app/subscription',
      label: 'Subscribe',
      icon: CreditCardIcon,
      activeIcon: CreditSolid
    },
    {
      path: '/app/profile',
      label: 'Profile',
      icon: UserIcon,
      activeIcon: UserSolid
    }
  ]

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/'
    }
    return location.pathname.startsWith(path)
  }

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    // No special handling needed - routing will handle subscription checks
    return
  }

  return (
    <>
      <nav className="mobile-nav">
        {/* Subscription Status Bar */}
        {!hasSubscription && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 text-center">
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="text-sm font-medium"
            >
              Subscribe for $4.99/month to access all deals
            </button>
          </div>
        )}
        
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const IconComponent = active ? item.activeIcon : item.icon
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors duration-200 ${
                  active 
                    ? 'text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  )
}