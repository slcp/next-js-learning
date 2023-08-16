import Link from "next/link";

export default async function Page({}: {}) {
  return <><div>Intercept page</div>
  <ul>
    {[1,2,3].map(i => <li key={i}><Link href={`/intercept/item/${i}`}>{i}</Link></li>)}
  </ul></>;
}
