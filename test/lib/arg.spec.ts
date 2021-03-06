import { IArgParamItem, IArgParamList } from './../../src/lib/arg';
import { Arg } from '@/lib/arg';

describe('Test Arg class', () => {
  let arg: Arg;

  beforeEach(() => {
    arg = new Arg({ isTest: true });
  });

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
    expect(arg._argRawItems).toEqual(expected);
  });

  describe('val:', () => {
    beforeEach(() => {
      arg.parse('--param 01');
    });

    it('defaut', () => {
      expect(arg.val('param')).toBe('01');
    });

    it('string', () => {
      expect(arg.val.str('param')).toBe('01');
    });

    it('number', () => {
      expect(arg.val.num('param')).toBe(1);
    });

    it('boolean', () => {
      expect(arg.val.bool('param')).toBe(true);
    });

    it('array', () => {
      expect(arg.val.arr('param')).toEqual(['01']);
    });
  });

  it.each(<[IArgParamItem['type'], any, any][]>[
    /// type, input, output
    ['string', 101, '101'],
    ['string', true, 'true'],
    ['number', true, 1],
    ['number', false, 0],
    ['boolean', '', false],
    ['boolean', '0', true],
    ['array', 'xxx', ['xxx']],
    //
  ])('convertToType(%s, %o): %o', (type, input, expected) => {
    expect(arg.convertToType(type, input)).toEqual(expected);
  });

  it.each([
    ///
    ['--clone https://github.com/avil13', 'clone', 'c'],
    // ['-c https://github.com/avil13', 'clone', 'c'],
  ])('argument alias are equal (%s, %s, %s)', (input, alias1, alias2) => {
    arg.parse(input);
    arg.param(`${alias1},${alias2}`, '', 'some description');

    expect(arg.val(alias1) === arg.val(alias2)).toBe(true);
  });

  it('set param by signature', () => {
    const defaultStr = 'default data';

    arg.param('str,s', defaultStr, '...', 'string');

    expect(arg.val('str')).toBe(defaultStr);
  });

  it('set params by options', () => {
    const defaultVal = 101;

    const params: IArgParamList = {
      num: {
        type: 'number',
        alias: 'n',
        default: defaultVal,
        description: 'max value',
      },
    };

    arg.params(params);

    expect(arg.val('num')).toBe(defaultVal);
    expect(arg.val('n')).toBe(defaultVal);
  });
});
