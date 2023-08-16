import { RenderTime, doSomethingAsync } from "./shared";

export default async function Page({}: {}) {
  return <RenderTime time={await doSomethingAsync(1000)} />;
}
