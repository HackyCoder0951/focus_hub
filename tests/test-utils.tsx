import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function createTestQueryClient(options: { gcTime?: number } = {}) {
  return new QueryClient({
    defaultOptions: {
      // gcTime 0 by default so component tests don't leak state between
      // cases. Hook tests that manually seed cache data with no active
      // observer (e.g. `setQueryData` before `renderHook`) need a longer
      // gcTime — an unobserved query is otherwise garbage-collected before
      // a mutation's `onMutate` gets a chance to read it.
      queries: { retry: false, gcTime: options.gcTime ?? 0 },
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
