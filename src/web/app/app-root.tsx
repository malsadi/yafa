import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { ClerkProviderForLanguage } from './clerk-provider-for-language';
import { createAppRouter } from './create-app-router';
import { LanguageProvider } from './language/language-provider';

export function AppRoot({ clerkPublishableKey }: { clerkPublishableKey: string }) {
  const [queryClient] = useState(() => new QueryClient());
  const [router] = useState(createAppRouter);
  return (
    <LanguageProvider>
      <ClerkProviderForLanguage publishableKey={clerkPublishableKey}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ClerkProviderForLanguage>
    </LanguageProvider>
  );
}
