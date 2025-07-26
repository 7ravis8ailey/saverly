import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Load debug if requested
if (window.location.pathname === '/debug' || window.location.search.includes('debug=true')) {
  import('./debug.tsx')
} else {
  // Load the main app
  import('./App.tsx').then(({ default: App }) => {
    import('./components/ErrorBoundary').then(({ ErrorBoundary }) => {
      const rootElement = document.getElementById('root')
      if (rootElement) {
        createRoot(rootElement).render(
          <StrictMode>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </StrictMode>
        )
      }
    }).catch(error => {
      console.error('Error loading ErrorBoundary:', error)
      // Fallback - load app without error boundary
      import('./App.tsx').then(({ default: App }) => {
        const rootElement = document.getElementById('root')
        if (rootElement) {
          createRoot(rootElement).render(<App />)
        }
      }).catch(appError => {
        console.error('Error loading App:', appError)
        // Final fallback
        const rootElement = document.getElementById('root')
        if (rootElement) {
          rootElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: #f8fafc;">
              <div style="text-align: center; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3ABF7E, #2ea66a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: white; font-size: 32px; font-weight: bold;">S</div>
                <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 16px; background: linear-gradient(135deg, #3ABF7E, #2ea66a); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">Saverly</h1>
                <p style="color: #718096; margin: 0 0 24px;">Your Local Coupon Marketplace</p>
                <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 16px; border-radius: 8px; color: #991b1b;">
                  Application loading error. Please try refreshing the page.
                </div>
              </div>
            </div>
          `
        }
      })
    })
  }).catch(error => {
    console.error('Error loading main app:', error)
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: #f8fafc;">
          <div style="text-align: center; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3ABF7E, #2ea66a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: white; font-size: 32px; font-weight: bold;">S</div>
            <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 16px; background: linear-gradient(135deg, #3ABF7E, #2ea66a); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">Saverly</h1>
            <p style="color: #718096; margin: 0 0 24px;">Your Local Coupon Marketplace</p>
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 16px; border-radius: 8px; color: #991b1b;">
              Critical loading error. Please contact support.
            </div>
          </div>
        </div>
      `
    }
  })
}
