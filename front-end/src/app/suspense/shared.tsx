export const doSomethingAsync = async (waitFor: number): Promise<number> =>
  new Promise((resolve) => setTimeout(() => resolve(waitFor), waitFor));

export const RenderTime = ({ time }: { time: number }) => (
  <div>I waited for {time} milliseconds to render</div>
);

export const AsyncComponent = async ({ time }: { time: number }) => (
  <RenderTime time={await doSomethingAsync(time)} />
);
