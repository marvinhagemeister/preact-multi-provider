# Preact MultiProvider

Provide multiple contexts at the same time without getting lost in a jungle of context providers.

If you properly group context values and don't go crazy with context, than you probably don't need this.

## Usage

Install the package:

```sh
# npm
npm install preact-multi-provider
# yarn
yarn add preact-multi-provider
# pnpm
pnpm install preact-multi-provider
```

And then use it in your code:

```jsx
import { createContext } from "preact";
import { MultiProvider, provide } from "preact-multi-provider";

const FooContext = createContext("foo");
const BarContext = createContext("bar");
const BazContext = createContext("baz");
const BoofContexxt = createContext("boof");

// usage
<MultiProvider
  values={[
    { context: FooContext, value: "foo value" },
    { context: BarContext, value: "bar value" },
    { context: BazContext, value: "baz value" },
    { context: BoofContext, value: "boof value" },
  ]}
></MultiProvider>;
```

## Why?

In the ideal case you should group context values based on how they are updated over time. Context values that are never updated don't need to be spread out across multiple context providers. In that case you'd store the value on the same object in a single context

```jsx
// These values are loaded on init, but never change after that.
// Let's pretend that those are coming from an initial API request.
const foo = "foo";
const bar = "bar";

// Both "foo" and "bar" never change independently, so just group them
// in one context. No need to use multiple contexts.
const AppState = createContext({ foo: null, bar: null });

// Somwhere close to the root of your app
<AppState.Provider value={{ foo, bar }}>...</AppState.Provider>;
```

> **Note**
> Grouping values that don't change independently is good for performance and makes debugging easier, because we can skip rendering a lot of components in the tree. If you can avoid the need to use this library the better!

Most enterprise projects end up with >50 providers close to the root of the tree. That makes the code difficult to read and introduces a lot of noise in DevTools and profiling tools.

Before:

```jsx
<FooContext.Provider value={"foo"}>
  <BarContext.Provider value={"bar"}>
    <BazContext.Provider value={"baz"}>
      <BoofContext.Provider value={"boof"}>...</BoofContext.Provider>
    </BazContext.Provider>
  </BarContext.Provider>
</FooContext.Provider>
```

Rewriting both the consuming portions as well as the providing ones is often continiously pushed into the future. So this library makes it easier to migrate to a grouped context model by allowing you to clean up the component tree without touching the consumer side.

After:

```jsx
import { MultiProvider } from "preact-multi-provider";

// usage
<MultiProvider
  values={[
    { context: FooContext, value: "foo" },
    { context: BarContext, value: "bar" },
    { context: BazContext, value: "baz" },
    { context: BoofContext, value: "boof" },
  ]}
></MultiProvider>;
```

This will get rid of all the context providers and combine them into a single one. That works because in Preact the internals don't have a concept of context provider components, so we can add as many context objects as we want at the same time.

With this in place, further refactorings to proper grouped context's should be more easy.

## License

`MIT`, see the [LICENSE](./LICENSE) file.
