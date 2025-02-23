import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ConnectionIndicator from '../../../../frontend/components/connection-indicator'
 
// TODO: ideally, this component would get the differnet statuses as a prop, or at least they would be saved in a const
describe('404 Page', () => {
  it.each([
    ["connected", "מחובר"],
    ["connecting", "מתחבר..."],
    ["disconnected", "מנותק"],
    ["error", "שגיאה"],
  ])('show correct status', (status, translated) => {
    render(<ConnectionIndicator status={status} />)
 
    const text = screen.getByText(translated)
 
    expect(text).toBeInTheDocument()
  })
})