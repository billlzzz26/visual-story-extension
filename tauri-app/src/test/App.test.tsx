import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the Visual Story Planner title', () => {
    render(<App />)
    expect(screen.getByText('Visual Story Planner')).toBeInTheDocument()
  })

  it('renders all nav items', () => {
    render(<App />)
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Graph')).toBeInTheDocument()
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('shows editor view by default', () => {
    render(<App />)
    expect(screen.getByText(/editor\s+view/i)).toBeInTheDocument()
  })
})
