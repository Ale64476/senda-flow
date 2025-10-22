import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';

describe('Auth Component', () => {
  test('renders SendaFit title', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    expect(screen.getByText(/SendaFit/i)).toBeInTheDocument();
  });

  test('renders sign in and sign up tabs', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
    expect(screen.getByRole('tab', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Registrarse/i })).toBeInTheDocument();
  });
});
