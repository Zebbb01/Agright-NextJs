"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const users = [
  { id: 1, name: "Gerald Villaceran", email: "gerald@example.com", role: "Admin" },
  { id: 2, name: "Ronald Bahan", email: "ronald@example.com", role: "Encoder" },
];

export default function UsersTable() {
  return (
    <Table>
      <TableCaption>A list of registered users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Users: {users.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
