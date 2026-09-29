import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../src/web/app/api/api-error';
import { ErrorAlert } from '../../../src/web/components/error-alert';
import { renderForTest, setBrowserLanguages } from '../render-for-test';

describe('ErrorAlert (D-224)', () => {
  it('says a refusal in words, from the screen’s own texts or the portal-wide ones', async () => {
    setBrowserLanguages(['en-GB']);
    const own = await renderForTest(
      <ErrorAlert
        error={new ApiError(403, 'permission.denied')}
        refusals={{ 'permission.denied': 'You may not do this.' }}
      />,
    );
    expect(own.textContent).toBe('You may not do this.');

    const portalWide = await renderForTest(
      <ErrorAlert error={new ApiError(403, 'permission.denied')} />,
    );
    expect(portalWide.textContent).toBe('You may not see or do this here.');

    const failed = await renderForTest(<ErrorAlert error={new Error('network')} />);
    expect(failed.textContent).toBe('Something went wrong. Please try again.');
  });
});
