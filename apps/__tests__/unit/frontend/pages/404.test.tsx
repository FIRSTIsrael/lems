import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Page404 from '../../../../frontend/pages/404'
 
describe('404 Page', () => {
  it('renders two headings', () => {
    render(<Page404 />)
 
    const title = screen.getByRole('heading', { level: 1 })
    const heading = screen.getByRole('heading', { level: 2 })
 
    expect(title).toBeInTheDocument()
    expect(heading).toBeInTheDocument()
  })

  // it('renders 404 unchanged', () => {
  //   const { container } = render(<Page404 />)
  //   expect(container).toMatchSnapshot()
  // })
})