import { withTimeout } from '../utils/withTimeout';

describe('withTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with the promise value when it settles before the timeout', async () => {
    const promise = Promise.resolve('ok');
    await expect(withTimeout(promise, 1000, 'op')).resolves.toBe('ok');
  });

  it('rejects with a tagged timeout error when the promise takes too long', async () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('late'), 5000);
    });

    const wrapped = withTimeout(promise, 100, 'op');
    const expectation = expect(wrapped).rejects.toMatchObject({ code: 'op_timeout' });

    jest.advanceTimersByTime(100);
    await expectation;
  });

  it('propagates the original rejection if the promise rejects first', async () => {
    const promise = Promise.reject(new Error('boom'));
    await expect(withTimeout(promise, 1000, 'op')).rejects.toThrow('boom');
  });

  it('clears the timer when the promise resolves first (no leaked timeouts)', async () => {
    const clearSpy = jest.spyOn(global, 'clearTimeout');
    const promise = Promise.resolve('fast');
    await withTimeout(promise, 5000, 'op');
    expect(clearSpy).toHaveBeenCalled();
  });

  it('clears the timer when the promise rejects first', async () => {
    const clearSpy = jest.spyOn(global, 'clearTimeout');
    const promise = Promise.reject(new Error('boom'));
    await withTimeout(promise, 5000, 'op').catch(() => undefined);
    expect(clearSpy).toHaveBeenCalled();
  });
});
