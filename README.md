# Saverly Mobile App

A location-based digital coupon mobile application connecting local businesses in Northeast TN with cost-conscious consumers through a subscription model ($4.99/month).

## 🚀 Project Overview

Saverly is being developed as a React Native mobile app with Supabase backend, migrating from existing Replit/PostgreSQL codebase while preserving Stripe and Google Maps API keys from the Base44 version.

### Technology Stack
- **Mobile App**: React Native (Expo)
- **Web Admin**: React (Vite)
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Payments**: Stripe
- **Maps**: Google Maps API
- **Deployment**: EAS (mobile), Netlify (web)

## 📁 Project Structure

```
├── docs/                      # Project documentation
│   ├── CLAUDE_INSTRUCTIONS.md # Claude instance handoff guide
│   ├── saverly-mobile-prd.md  # Complete product requirements
│   └── project-todos.md       # Master task list
├── src/                       # Source code (to be created)
│   ├── mobile/               # React Native app
│   ├── web/                  # Admin dashboard
│   └── shared/               # Shared utilities
├── supabase/                 # Supabase configuration
└── README.md                 # This file
```

## 🎯 Development Phases

### Phase 1: Foundation Setup (Week 1) - 0% Complete
- [ ] Create React Native project with Expo
- [ ] Set up Supabase project and database
- [ ] Migrate API keys from Base44
- [ ] Configure authentication
- [ ] Set up navigation structure

### Phase 2: Core Features (Week 2-3) - 0% Complete
- [ ] Authentication screens
- [ ] Coupon discovery and display
- [ ] QR code generation and redemption
- [ ] Stripe payment integration
- [ ] Location services and maps

### Phase 3: Advanced Features (Week 4) - 0% Complete
- [ ] Push notifications
- [ ] Admin dashboard (web)
- [ ] UI/UX enhancements
- [ ] Analytics integration

### Phase 4: Deployment (Week 5) - 0% Complete
- [ ] App store preparation
- [ ] Production deployment
- [ ] Beta testing
- [ ] Launch preparation

## 🔧 Quick Start

### For Claude Instances
When resuming work, read the project files in this order:
1. `CLAUDE_INSTRUCTIONS.md` - Handoff guide
2. `saverly-mobile-prd.md` - Product requirements
3. `project-todos.md` - Current task status

### For Developers
```bash
# Clone repository
git clone https://github.com/travisbailey/saverly-mobile.git
cd saverly-mobile

# Install dependencies (when available)
npm install

# Start development server (when available)
npm run dev
```

## 📋 Current Status

**Current Phase**: Foundation Setup  
**Progress**: 0% overall (0/31 core tasks complete)  
**Last Completed**: Project documentation and structure  
**Currently Working On**: Setting up development environment  
**Next Priority**: Extract API keys from Base44, create React Native project  
**Blockers**: None identified  

## 📞 Support

- **Project Owner**: Travis Bailey
- **Architecture**: React Native + Supabase
- **Deployment**: EAS (mobile), Netlify (web)
- **Target Launch**: Q1 2025

## 📝 Key Features

### User Features
- Location-based coupon discovery
- QR code redemption with 60-second timer
- Subscription management ($4.99/month)
- Profile and address management
- Push notifications for new deals

### Business Features
- Admin dashboard for coupon management
- Business profile management
- Redemption analytics
- Real-time coupon activation/deactivation

### Technical Features
- Real-time subscription status sync
- Secure payment processing with Stripe
- Location-based sorting and filtering
- Cross-platform mobile compatibility
- Progressive Web App for admin functions

---

**Built with React Native, Supabase, and ❤️**