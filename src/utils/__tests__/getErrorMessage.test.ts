import { describe, expect, it } from 'vite-plus/test';

import getErrorMessage from '../getErrorMessage.ts';

describe('Test the error message converter', () => {
  it('gets the default error message', () => {
    const errorMessage = getErrorMessage();
    expect(errorMessage).toBe('unknown error');
  });

  it('gets a string error message', () => {
    const errorString = 'My error message';
    const errorMessage = getErrorMessage(errorString);
    expect(errorMessage).toBe(errorString);
  });

  it('gets an error object', () => {
    const errorString = 'My error message';
    const errorObject = new TypeError(errorString);
    const errorMessage = getErrorMessage(errorObject);
    expect(errorMessage).toBe(`TypeError: ${errorString}`);
  });
});
