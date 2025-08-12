import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the main component to avoid loading CSV data in tests
jest.mock('./components/FishToxMain', () => ({
  FishToxMain: () => <div>FishTox Main Component</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);

    expect(screen.getByText('FishTox Main Component')).toBeInTheDocument();
  });
});
