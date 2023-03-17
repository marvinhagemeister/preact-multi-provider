import { type Component, type ComponentChildren, type Context } from "preact";

export type ContextDef<T> = {
  context: Context<T>;
  value: T;
};

export interface MultiProviderProps<
  T extends readonly [unknown, ...unknown[]]
> {
  values: {
    [K in keyof T]: ContextDef<T[K]>;
  };
  children: ComponentChildren;
}

export function MultiProvider<T extends readonly [unknown, ...unknown[]]>(
  this: Component<MultiProviderProps<T>>,
  props: MultiProviderProps<T>
) {
  if (!this.getChildContext) {
    let subs: Component[][] = [];
    let ctx: Record<string, unknown> = {};
    const _this = this;

    for (let i = 0; i < props.values.length; i++) {
      subs.push([]);
      ctx[(props.values[i].context as any).__c] = {
        get props() {
          return { value: _this.props.values[i].value };
        },
        sub: (c: Component) => {
          subs[i].push(c);
          let old = c.componentWillUnmount;
          c.componentWillUnmount = () => {
            subs[i].splice(subs[i].indexOf(c), 1);
            if (old) old.call(c);
          };
        },
      };
    }

    this.getChildContext = () => ctx;

    this.shouldComponentUpdate = function (_props: MultiProviderProps<T>) {
      const current = this.props.values;
      const next = _props.values;
      for (let i = 0; i < next.length; i++) {
        if (
          current[i].context === next[i].context &&
          current[i].value !== _props.values[i].value
        ) {
          subs[i].some((c) => c.forceUpdate());
        }
      }

      return true;
    };
  }

  return props.children as any;
}

/**
 * @deprecated - This is not needed anymore. It was a helper to guide
 * TypeScript inference, but with recent improvements to our typings this is redundant.
 */
export function provide<T>(context: Context<T>, value: T): ContextDef<T> {
  return { context, value };
}
