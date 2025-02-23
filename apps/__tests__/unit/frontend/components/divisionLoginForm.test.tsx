import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import DivisionLoginForm from '../../../../frontend/components/login/division-login-form'
import { mockDivision, mockEvent } from '../../../mocks';
 
const roomsList = ["אלבטרוס", "טונה", "לוויתן", "פינגווין"];
const tablesList = ["צדפה", "דולפין", "אלמוג", "שונית"];

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('Division Login Form', () => {
  it.only('show correct options for referee', () => {
    render(
        <DivisionLoginForm 
      recaptchaRequired={false} 
      event={mockEvent} 
      division={mockDivision} 
      rooms={roomsList} 
      tables={tablesList} 
      onCancel={() => {}} 
      />
    );

    fireEvent.click(screen.getByText('תפקיד'))
    fireEvent.click(screen.getByText('שופט זירה'))
 
    roomsList.forEach(roomName => {
      expect(roomName).not.toBeInTheDocument();
    });
    tablesList.forEach(tableName => {
      expect(tableName).toBeInTheDocument();
    });
  });

  it('show correct options for judges', () => {
    render(<DivisionLoginForm 
      recaptchaRequired={false} 
      event={mockEvent} 
      division={mockDivision} 
      rooms={roomsList} 
      tables={tablesList} 
      onCancel={() => {}} 
      />)
 
      fireEvent.click(screen.getByText('תפקיד'))
      fireEvent.click(screen.getByText('שופט חדר'))
   
      roomsList.forEach(roomName => {
        expect(roomName).not.toBeInTheDocument();
      });
      tablesList.forEach(tableName => {
        expect(tableName).toBeInTheDocument();
      });
  })
})