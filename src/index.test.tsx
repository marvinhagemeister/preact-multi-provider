import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MultiProvider, provide } from ".";
import { createContext, render } from "preact";
import { useContext, useMemo, useState } from "preact/hooks";
import { act, teardown } from "preact/test-utils";

describe("MultiContext", () => {
  let scratch: HTMLElement;

  beforeEach(() => {
    scratch = document.createElement("div");
    scratch.id = "scratch";
    document.body.appendChild(scratch);
  });

  afterEach(() => {
    scratch.remove();
    teardown();
  });

  it("should use passed value", () => {
    const Ctx = createContext("a");

    function Child() {
      const ctx = useContext(Ctx);
      return <p>{String(ctx)}</p>;
    }

    function App() {
      return (
        <MultiProvider values={[{ context: Ctx, value: "A" }]}>
          <Child />
        </MultiProvider>
      );
    }
    render(<App />, scratch);

    expect(scratch.textContent).toEqual("A");
  });

  it("should type context values", () => {
    const Ctx = createContext("a");
    const Ctx2 = createContext(0);

    function Child() {
      const ctx = useContext(Ctx);
      return <p>{String(ctx)}</p>;
    }

    function App() {
      return (
        <MultiProvider
          values={[
            { context: Ctx, value: "A" },
            { context: Ctx2, value: 1 },
          ]}
        >
          <Child />
        </MultiProvider>
      );
    }
    render(<App />, scratch);

    expect(scratch.textContent).toEqual("A");
  });

  it("should skip referential children", () => {
    const Ctx = createContext("a");

    const spy = vi.fn();
    function Child() {
      const ctx = useContext(Ctx);
      spy(ctx);
      return <p>{String(ctx)}</p>;
    }

    const vnode = <Child />;

    function App(props: { value: number }) {
      return (
        <MultiProvider values={[{ context: Ctx, value: "A" }]}>
          {vnode}
        </MultiProvider>
      );
    }
    render(<App value={1} />, scratch);
    render(<App value={2} />, scratch);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should not update if value remains the same", () => {
    const Ctx = createContext(0);

    const spy = vi.fn();
    function Child() {
      const ctx = useContext(Ctx);
      spy(ctx);
      return <p>{String(ctx)}</p>;
    }

    function Blocker() {
      return useMemo(() => <Child />, []);
    }

    let update: (v: number) => void;
    function App() {
      const [v, set] = useState(0);
      update = set;

      return (
        <MultiProvider values={[{ context: Ctx, value: v }]}>
          <Blocker />
        </MultiProvider>
      );
    }
    render(<App />, scratch);
    spy.mockClear();

    expect(scratch.textContent).toEqual("0");

    act(() => {
      update(0);
    });

    expect(scratch.textContent).toEqual("0");
    expect(spy).not.toBeCalled();
  });

  it("should only update changed contexts", () => {
    const Ctx1 = createContext("a");
    const Ctx2 = createContext(0);

    const spy1 = vi.fn();
    const spy2 = vi.fn();

    function Child1() {
      const ctx = useContext(Ctx1);
      spy1(ctx);
      return <p>{String(ctx)}</p>;
    }

    function Child2() {
      const ctx = useContext(Ctx2);
      spy2(ctx);
      return <p>{String(ctx)}</p>;
    }

    let update: (v: number) => void;

    function Blocker() {
      return useMemo(
        () => (
          <>
            <Child1 />
            <Child2 />
          </>
        ),
        []
      );
    }

    function App() {
      const [b, setB] = useState(0);
      update = (v: number) => setB(v);
      return (
        <MultiProvider
          values={[
            { context: Ctx1, value: "A" },
            { context: Ctx2, value: b },
          ]}
        >
          <Blocker />
        </MultiProvider>
      );
    }
    render(<App />, scratch);

    spy1.mockClear();
    spy2.mockClear();

    expect(scratch.textContent).toEqual("A0");

    act(() => {
      update(1);
    });

    expect(scratch.textContent).toEqual("A1");
    expect(spy1).not.toBeCalled();
    expect(spy2).toBeCalledWith(1);
  });

  it("should works with provide helper", () => {
    const Ctx = createContext("a");

    function Child() {
      const ctx = useContext(Ctx);
      return <p>{String(ctx)}</p>;
    }

    function App() {
      return (
        <MultiProvider values={[provide(Ctx, "A")]}>
          <Child />
        </MultiProvider>
      );
    }
    render(<App />, scratch);

    expect(scratch.textContent).toEqual("A");
  });
});
