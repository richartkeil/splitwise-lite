import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'

describe('Button', () => {
  it('renders with primary variant classes by default', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toHaveClass('from-primary-500')
    expect(button).toHaveClass('text-white')
  })

  it('renders with secondary variant classes', () => {
    render(<Button variant="secondary">Cancel</Button>)

    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button).toHaveClass('glass')
    expect(button).toHaveClass('text-gray-700')
  })

  it('renders with danger variant classes', () => {
    render(<Button variant="danger">Delete</Button>)

    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('from-red-500')
    expect(button).toHaveClass('text-white')
  })

  it('renders with ghost variant classes', () => {
    render(<Button variant="ghost">Menu</Button>)

    const button = screen.getByRole('button', { name: 'Menu' })
    expect(button).toHaveClass('bg-transparent')
  })

  it('renders with correct size classes', () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole('button', { name: 'Small' })
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-1.5')
    expect(button).toHaveClass('text-sm')
  })
})

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>,
    )

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies additional className', () => {
    render(<Card className="custom-class">Content</Card>)

    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('custom-class')
    expect(card).toHaveClass('glass')
    expect(card).toHaveClass('rounded-2xl')
  })
})

describe('Dialog', () => {
  it('renders children when open', () => {
    render(
      <Dialog open={true} onClose={vi.fn()} title="Test Dialog">
        <p>Dialog content</p>
      </Dialog>,
    )

    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="Test Dialog">
        <p>Dialog content</p>
      </Dialog>,
    )

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Dialog content')).not.toBeInTheDocument()
  })
})

describe('Input', () => {
  it('renders with label', () => {
    render(<Input id="test-input" label="Email" />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders without label', () => {
    render(<Input id="test-input" placeholder="Type here" />)

    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })
})
