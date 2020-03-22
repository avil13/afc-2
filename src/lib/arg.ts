type DefaultValue = null | string | number | boolean;

export interface IArgOptions {
  [key: string]: IArgOptionItem;
}

export interface IArgOptionItem {
  type: 'string' | 'number' | 'array' | 'boolean';
  default?: string | number | boolean;
  description?: string;
  alias?: string;
  string?: boolean;
}

export class Arg {
  private _argv: string[] = [];
  private _argItems: any = {};
  private static _singletonInstance: Arg;

  constructor(...argumentsList: string[]) {
    if (!(this instanceof Arg)) {
      return new Arg(...argumentsList);
    }

    if (Arg._singletonInstance) {
      return Arg._singletonInstance;
    }

    Arg._singletonInstance = this;

    this.readArguments(...argumentsList);
  }

  readArguments(...argumentsList: string[]) {
    this._argv = argumentsList.length ? argumentsList : process.argv.slice(2);
    this._argItems = {};
    return this;
  }

  parse(...args: string[]) {
    const argStr = args.join(' ');
    const reg = /-{1,2}([^\s]+)(.*?(?=\s-)|.*)/g;

    argStr.replace(reg, ($0, key, value, ...xx) => {
      if (!value) {
        this._argItems[key] = true;
      } else {
        const v = value
          .split(/\s/)
          .filter((v: string) => !!v)
          .map((v: string) => v.trim());

        this._argItems[key] = v.length > 1 ? v : v[0];
      }
      return $0;
    });

    return this;
  }

  setOptions(options: object) {}

  val(key: string, defaultValue: DefaultValue = null) {
    return (this._argItems[key] && this._argItems[key].value) || defaultValue;
  }

  param(
    nameItem: string,
    defaultValue: DefaultValue,
    description: string,
    type?: boolean | number | string
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const self = this;
    let parentKey = '';

    nameItem
      .split(',')
      .map((s) => s.trim())
      .forEach((key, i) => {
        if (this._argItems[key]) {
          throw new Error(`Argument "${key}" already defined.`);
        }

        if (i === 0) {
          parentKey = key;

          this._argItems[key] = this.makeParam({
            key,
            defaultValue,
            description,
            type,
          });
        } else {
          this._argItems[key] = {
            _parent$: parentKey,
            // get value() {
            //   return self._argItems[this._parent$].value;
            // },
          };
        }
      });

    return this;
  }

  private makeParam(options: {
    key: string;
    defaultValue: DefaultValue;
    description: string;
    type?: string | boolean | number;
  }) {
    /* eslint-disable @typescript-eslint/no-this-alias */
    const self = this;
    /* eslint-enable @typescript-eslint/no-this-alias */

    return {
      ...options,
      get value() {
        const val = self.getArgumentValue(options.key);

        switch (typeof options.type) {
          case 'string':
            return `${val}`;
          case 'boolean':
            return !!val;
          case 'number':
            return +(val || 0);
          default:
            return val;
        }
      },
    };
  }

  private getArgumentValue(key: string) {
    key = this.getActiveArgumentKey(key);

    console.log('=>', key);

    // todo: !!!
    const index = this._argv.indexOf(key);

    if (index === -1) {
      return null;
    }

    const names = Object.keys(this._argItems);
    const nextArgumentAsValue = this._argv[index + 1];

    const value = (this._argItems[key] && this._argItems[key].value) || null;

    return names.includes(nextArgumentAsValue) ? value : nextArgumentAsValue;
  }

  private getActiveArgumentKey(key: string): string {
    return (this._argItems[key] && this._argItems[key]._parent$) || key;
  }
}
