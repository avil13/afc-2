import { Arg } from '@/lib/arg';

describe('Test Arg class', () => {
  let arg: Arg;

  beforeEach(() => {
    //@ts-ignore
    Arg._singletonInstance = undefined;
    arg = new Arg();
  });

  it.skip('add parameter', () => {
    const repo1 = 'my@github.com/repo';
    const repo2 = 'git@github.com/some-repo';

    arg.readArguments('--clone', repo1);

    arg.param('--clone, -c', repo2, 'Clone repo');

    expect(arg).toBe({});

    expect(arg.val('-c')).toBe(repo1);
    // expect(arg.val('--clone')).toBe(repo1);
  });

  it.skip('readArguments', () => {});

  it.each([
    ///
    ['-x', { x: true }],
    ['--x', { x: true }],
    ['--name 100 ', { name: '100' }],
    ['--name 100 200 ', { name: ['100', '200'] }],
    [
      '--x 1 --y 2 3 4 -z 3 -A -b',
      { x: '1', y: ['2', '3', '4'], z: '3', A: true, b: true },
    ],
  ])('parse args (%s)', (input, expected) => {
    arg.parse(input);
    //@ts-ignore
    expect(arg._argItems).toEqual(expected);
  });

  it.skip('set param by signature', () => {});
  it.skip('set param by options', () => {});

  it.skip('argument alias are equal ', () => {
    // prepare
    expect(arg.val('c') === arg.val('clone')).toBe(true);
  });
});
