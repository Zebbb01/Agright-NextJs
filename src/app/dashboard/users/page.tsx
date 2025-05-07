import UsersTable from "@/components/table/UsersTable";

export default function UsersPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UsersTable />
    </div>
  );
}
