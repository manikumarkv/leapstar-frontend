import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

import { HealthStatus } from './HealthStatus';
import * as useHealthStatusModule from '../../hooks/useHealthStatus';

const renderWithQueryClient = (ui: ReactNode) => {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('<HealthStatus />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state', () => {
    jest.spyOn(useHealthStatusModule, 'useHealthStatus').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    renderWithQueryClient(<HealthStatus />);

    expect(screen.getByText(/checking health/i)).toBeInTheDocument();
  });
});
