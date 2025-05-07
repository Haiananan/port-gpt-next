declare module "ora" {
  interface OraInstance {
    start(text?: string): OraInstance;
    succeed(text?: string): OraInstance;
    fail(text?: string): OraInstance;
    stop(): OraInstance;
  }

  function ora(
    options: string | { text?: string; color?: string }
  ): OraInstance;
  export = ora;
}

declare module "chalk" {
  const chalk: {
    red: (text: string) => string;
    green: (text: string) => string;
    blue: (text: string) => string;
    yellow: (text: string) => string;
    cyan: (text: string) => string;
    [key: string]: any;
  };
  export = chalk;
}

declare module "cli-progress" {
  interface ProgressBarOptions {
    format: string;
    barCompleteChar: string;
    barIncompleteChar: string;
    hideCursor: boolean;
    [key: string]: any;
  }

  interface ProgressBar {
    start(total: number, current: number): void;
    update(current: number): void;
    stop(): void;
  }

  class SingleBar implements ProgressBar {
    constructor(options: ProgressBarOptions, preset?: any);
    start(total: number, current: number): void;
    update(current: number): void;
    stop(): void;
  }

  const Presets: {
    shades_classic: any;
    [key: string]: any;
  };

  export { SingleBar, Presets };
}
