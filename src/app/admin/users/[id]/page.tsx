export default function TestEditUserPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Edit User</h1>
      <p>ID: {params.id}</p>
    </div>
  );
}
