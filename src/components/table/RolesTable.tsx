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
import { Badge } from "../ui/badge";

const roles = [
  { id: 1, name: "Admin", description: "Full access to the system" },
  { id: 2, name: "Encoder", description: "Can input data only" },
];

export default function RolesTable() {
  return (
    <Table>
      <TableCaption>A list of user roles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell>{role.name}</TableCell>
            <TableCell><Badge variant="default">{role.description}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total Roles: {roles.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
