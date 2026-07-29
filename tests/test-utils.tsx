import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function AllProviders({
  children,
  queryClient = createTestQueryClient(),
  initialEntries = ["/"],
}: {
  children: ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options: {
    queryClient?: QueryClient;
    initialEntries?: string[];
  } & Omit<RenderOptions, "wrapper"> = {}
) {
  const { queryClient, initialEntries, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} initialEntries={initialEntries}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}

export * from "@testing-library/react";
