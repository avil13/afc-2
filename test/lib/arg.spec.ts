import { Arg } from '@/lib/arg';

describe('Test Arg class', () => {
  // it('should exist', () => {
  //   const arg = new Arg('--hello');

  //   expect(arg).toBeTruthy();
  // });

  it.skip('show arguments', () => {
    const arg = new Arg('--hello');

    expect(arg).toBe([]);
  });
});
