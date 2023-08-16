import Modal from "../../modal";

export default function Page({ params }: { params: { id: number } }) {
  return (
    <Modal>
      <div>Item page intercepted {params.id}</div>
    </Modal>
  );
}
