type DefaultValue = null | string | number | boolean;

export class Arg {
  private _argv: string[] = [];
  private _argItems: any = {};

  constructor(...argumentsList: string[]) {
    if (!(this instanceof Arg)) {
      return new Arg(...argumentsList);
    }

    this.readArguments(...argumentsList);
  }

  get arguments() {
    return [...this._argv];
  }

  readArguments(...argumentsList: string[]) {
    this._argv = argumentsList.length ? argumentsList : process.argv.slice(2);
    this._argItems = {};
    return this;
  }

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
      .map(s => s.trim())
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

export const arg = new Arg();
