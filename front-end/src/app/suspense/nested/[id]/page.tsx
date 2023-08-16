import { Suspense } from "react";
import { AsyncComponent, RenderTime } from "../../shared";

export default function Page({ params }: { params: { id: number } }) {
  return (
    <>
      <RenderTime time={0} />
      <Suspense fallback={<div>Loading 1...</div>}>
        <AsyncComponent time={params.id} />
      </Suspense>
      <Suspense fallback={<div>Loading 2...</div>}>
        <AsyncComponent time={params.id * 2} />
      </Suspense>
    </>
  );
}
