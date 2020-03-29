export interface IArgOptions {
  isTest?: boolean;
}

type DefaultValue = null | string | number | boolean;

export interface IArgParamItem {
  type: 'string' | 'number' | 'array' | 'boolean';
  default?: string | number | boolean;
  description?: string;
  alias?: string;
  string?: boolean;
}

export interface IParamItem {
  keys: string[];
  defaultValue?: DefaultValue;
  description?: string;
  type?: IArgParamItem['type'];
}

export interface IArgHelpWrapper {
  [key: string]: IParamItem;
}

/**
 * Class for working with cli arguments
 *
 */
export class Arg {
  // list parsed arguments
  private _argRawItems: any = {};

  private _argHelpWrapper: IArgHelpWrapper = {};

  private _allArgNames: string[] = [];

  constructor(options?: IArgOptions) {
    if (!(this instanceof Arg)) {
      return new Arg(options);
    }

    if (options?.isTest) {
      return;
    }

    this.parseArgv();
  }

  parseArgv() {
    this.parse.apply(this, process.argv.slice(2));
  }

  parse(...args: string[]) {
    const argStr = args.join(' ');
    const reg = /-{1,2}([^\s]+)(.*?(?=\s-)|.*)/g;

    argStr.replace(reg, ($0, key, value) => {
      if (!value) {
        this._argRawItems[key] = true;
      } else {
        const v = value
          .split(/\s{1,}/)
          .filter((v: string) => !!v)
          .map((v: string) => v.trim());

        this._argRawItems[key] = v.length > 1 ? v : v[0];
      }
      return $0;
    });

    return this;
  }

  get val() {
    const fn = (key: string) => {
      this.checkKey(key);
      const opt = this.getOptionsByKey(key);

      const value = this.getValueByKey(key);

      if (opt?.type) {
        return this.convertToType(opt.type, value || opt.defaultValue);
      }
      return value;
    };

    fn.str = (key: string) => {
      return this.convertToType('string', fn(key));
    };
    fn.num = (key: string) => {
      return this.convertToType('number', fn(key));
    };
    fn.bool = (key: string) => {
      return this.convertToType('boolean', fn(key));
    };
    fn.arr = (key: string) => {
      return this.convertToType('array', fn(key));
    };

    return fn;
  }

  checkKey(key: string) {
    if (this._argRawItems[key] === undefined && !this.getOptionsByKey(key)) {
      throw new Error(`Can't find argument "${key}"`);
    }
  }

  private getValueByKey(key: string) {
    if (this._argRawItems[key]) {
      return this._argRawItems[key];
    }
    const options = this.getOptionsByKey(key);
    if (options) {
      const len = options.keys.length;
      for (let i = 0; i < len; i++) {
        const optionKey = options.keys[i];

        if (this._argRawItems[optionKey]) {
          return this._argRawItems[optionKey];
        }
      }
    }
  }

  private getOptionsByKey(key: string) {
    let option;
    let keyLen = 0;
    for (let k in this._argHelpWrapper) {
      if (Object.prototype.hasOwnProperty.call(this._argHelpWrapper, k)) {
        option = this._argHelpWrapper[k];
        keyLen = option.keys.length;

        for (let i = 0; i < keyLen; i++) {
          if (option.keys[i] === key) {
            return option;
          }
        }
      }
    }
  }

  convertToType(
    type: IArgParamItem['type'],
    value: DefaultValue | DefaultValue[]
  ) {
    switch (type) {
      case 'boolean':
        if (typeof value === 'string' && ['true', 'false'].includes('value')) {
          return value === 'true';
        }
        return Boolean(value);
      case 'number':
        return Number(value);
        return;
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'string':
        return Array.isArray(value) ? value.join(' ') : String(value);
    }
    return value;
  }

  /**
   *
   * @param {string} name name of param, can be split by semicolon
   * @param defaultValue
   * @param description
   * @param type
   *
   * @example
   * const arg = new Arg();
   * arg.param('version,v', 'v0.0.1', 'Show version');
   */
  param(
    name: string,
    defaultValue?: any,
    description?: string,
    type?: IArgParamItem['type']
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    let parentKey = '';

    name
      .split(',')
      .map((s) => s.trim())
      .forEach((key, i) => {
        if (this._allArgNames.includes(key)) {
          throw new Error(`Argument "${key}" already defined.`);
        }

        this._allArgNames.push(key);

        if (i === 0) {
          parentKey = key;

          this._argHelpWrapper[parentKey] = {
            keys: [key],
            defaultValue,
            description,
            type,
          };
        } else {
          this._argHelpWrapper[parentKey].keys.push(key);
        }
      });

    return this;
  }

  getHelp(): string {
    const results: string[] = [];

    for (let k in this._argHelpWrapper) {
      if (Object.prototype.hasOwnProperty.call(this._argHelpWrapper, k)) {
        results;
      }
    }

    return results.join('\n');
  }

  getHelpString(item: IParamItem): string {
    const keys = item.keys
      .map((v, i) => `${i === 0 ? '-' : ''}-${v}`)
      .join(', ');
    const description = item.description || '';
    const defaultValue = item.defaultValue && `default: ${item.defaultValue}`;

    return [` ${keys}`, defaultValue, description]
      .filter((v) => !!v)
      .join('\t');
  }
}
