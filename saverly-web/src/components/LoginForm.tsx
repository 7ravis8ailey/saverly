import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic client-side validation
    if (!email || !password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error: authError } = await signIn(email, password)
      
      if (authError) {
        // Sanitize error messages to prevent information disclosure
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account')
        } else {
          setError('Login failed. Please try again.')
        }
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In to Saverly Admin</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary auth-button"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <a href="/register">Don't have an account? Sign up</a>
          <a href="/forgot-password">Forgot your password?</a>
        </div>
      </div>
    </div>
  )
}