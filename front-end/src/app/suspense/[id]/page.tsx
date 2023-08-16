import { RenderTime, doSomethingAsync } from "../shared";

export default async function Page({ params }: { params: { id: number } }) {
  return <RenderTime time={await doSomethingAsync(params.id)} />;
}
