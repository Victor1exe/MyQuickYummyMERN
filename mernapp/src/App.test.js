import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { CartProvider } from './components/ContextReducer';
import Login from './screens/Login';

test('renders the login screen', () => {
  render(
    <CartProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </CartProvider>
  );

  expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
});
