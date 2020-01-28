type DefaultValue = null | string | number | boolean;

export class Arg {
  private argv: string[] = [];
  private argItems: any = {};

  constructor(...argumentsList: any[]) {
    if (!(this instanceof Arg)) {
      return new Arg(...argumentsList);
    }

    this.argv = argumentsList.length ? argumentsList : process.argv.slice(2);
  }

  param(
    nameItem: string,
    defaultValue: DefaultValue,
    description: string,
    type?: boolean | number | string
  ) {
    nameItem
      .split(',')
      .map(s => s.trim())
      .forEach(key => {
        if (this.argItems[key]) {
          throw new Error(`Argument "${key}" already defined.`);
        }

        this.argItems[key] = this.makeParam({
          key,
          defaultValue,
          description,
          type,
        });
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
        const val = self.getArgumentValue(options.key, options.defaultValue);

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

  private getArgumentValue(key: string, defaultValue: DefaultValue) {
    const index = this.argv.indexOf(key);

    if (index === -1) {
      return null;
    }

    const names = Object.keys(this.argItems);
    const nextArgument = this.argv[index + 1];

    return names.includes(nextArgument) ? defaultValue : nextArgument;
  }
}
