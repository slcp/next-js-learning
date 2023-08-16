export default function Page({ params }: { params: { id: number } }) {
  return <div>Item page {params.id}</div>;
}
