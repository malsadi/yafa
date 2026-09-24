import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router';
import { LanguageProvider } from '../../src/web/app/language/language-provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Renders a component inside the real language provider and an in-memory
 * router, and returns its container. No testing library: react-dom and
 * jsdom are enough for the shell's small components.
 */
export async function renderForTest(
  element: ReactNode,
  options: { path?: string; route?: string } = {},
): Promise<HTMLElement> {
  const container = document.createElement('div');
  document.body.replaceChildren(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <LanguageProvider>
        <MemoryRouter initialEntries={[options.path ?? '/']}>
          <Routes>
            <Route path={options.route ?? '*'} element={element} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>,
    );
    await Promise.resolve();
  });
  return container;
}

export function setBrowserLanguages(languages: string[]): void {
  Object.defineProperty(navigator, 'languages', { value: languages, configurable: true });
}
