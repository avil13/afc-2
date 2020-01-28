type DefaultValue = null | string | number | boolean;

export class Arg {
  private static instance?: Arg;
  private argv: string[] = [];
  private argItems: any = {};

  constructor(...argumentsList: any[]) {
    if (Arg.instance) {
      return Arg.instance;
    }

    if (!(this instanceof Arg)) {
      return new Arg(...argumentsList);
    }

    this.argv = process.argv.slice(2);

    Arg.instance = this;
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
    type?: ArgumentType;
  }) {
    /* eslint-disable @typescript-eslint/no-this-alias */
    const self = this;
    /* eslint-enable @typescript-eslint/no-this-alias */

    return {
      ...options,
      get value() {
        const val = self.getArgumentValue(options.key, options.defaultValue);

        switch (options.type) {
          case String:
            return '' + val;
          case Boolean:
            return !!val;
          case Number:
            return +val;
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
