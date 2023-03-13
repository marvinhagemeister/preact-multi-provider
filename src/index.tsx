import {
  type Component,
  type ComponentChildren,
  type FunctionComponent,
  type Context,
} from "preact";

export type ContextDef<T> = {
  context: Context<T>;
  value: T;
};

export interface MultiProviderProps {
  values: ContextDef<any>[];
  children: ComponentChildren;
}

function _MultiProvider(
  this: Component<MultiProviderProps>,
  props: MultiProviderProps
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

    this.shouldComponentUpdate = function (_props: MultiProviderProps) {
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

export const MultiProvider =
  _MultiProvider as FunctionComponent<MultiProviderProps>;

export function provide<T>(context: Context<T>, value: T): ContextDef<T> {
  return { context, value };
}
