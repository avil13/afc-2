import { arg } from '@/lib/arg';

describe('Test Arg class', () => {
  /*
  it('should exist', () => {
    expect(arg).toBeTruthy();
  });

  it('show arguments', () => {
    arg.readArguments('--hello', 'world');

    expect(arg.arguments).toEqual(['--hello', 'world']);
  });

  //*/

  it('add parameter', () => {
    const repo1 = 'my@github.com/repo';
    const repo2 = 'git@github.com/some-repo';

    arg.readArguments('--clone', repo1);

    arg.param('--clone, -c', repo2, 'Clone repo');

    expect(arg).toBe({});

    expect(arg.val('-c')).toBe(repo1);
    // expect(arg.val('--clone')).toBe(repo1);
  });
});
