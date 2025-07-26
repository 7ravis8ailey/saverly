import { createRoot } from 'react-dom/client'

function DebugApp() {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  }

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3ABF7E 0%, #2ea66a 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            S
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #3ABF7E 0%, #2ea66a 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: '#3ABF7E'
          }}>
            Saverly Debug
          </h1>
          <p style={{ color: '#718096', fontSize: '18px', margin: '0' }}>
            Deployment Diagnostic Information
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#3ABF7E', marginBottom: '16px' }}>Environment Variables</h3>
          <div style={{
            backgroundColor: '#f7fafc',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '8px' }}>
                <strong>{key}:</strong> {value ? (key.includes('KEY') ? `${String(value).substring(0, 20)}...` : String(value)) : '❌ MISSING'}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#3ABF7E', marginBottom: '16px' }}>Current URL Info</h3>
          <div style={{
            backgroundColor: '#f7fafc',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            <div><strong>URL:</strong> {window.location.href}</div>
            <div><strong>Host:</strong> {window.location.host}</div>
            <div><strong>Pathname:</strong> {window.location.pathname}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #3ABF7E',
          padding: '16px',
          borderRadius: '8px',
          color: '#166534'
        }}>
          <strong>React App is Loading Successfully!</strong><br />
          If you can see this page, React is working. The issue might be with environment variables or specific components.
        </div>
      </div>
    </div>
  )
}

// Only render if we're at a debug URL
if (window.location.pathname === '/debug' || window.location.search.includes('debug=true')) {
  const root = document.getElementById('root')
  if (root) {
    createRoot(root).render(<DebugApp />)
  }
}