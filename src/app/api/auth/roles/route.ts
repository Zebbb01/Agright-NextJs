import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateId } from "@/lib/helpers/validation"; // Import the validation helper
import { handleApiError } from "@/lib/helpers/errorHandler"; // Import the error handler helper

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id"); // Renamed to avoid conflict with `validation.id`

    // If ID is provided, return a single role
    if (idParam) {
      const validation = validateId(idParam, "Role ID");
      if (!validation.isValid) {
        return validation.errorResponse;
      }
      const roleId = validation.id;

      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      return NextResponse.json(role);
    }

    // Otherwise return all roles
    const roles = await prisma.role.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(roles);
  } catch (error: any) {
    return handleApiError(error, "fetch roles");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, status } = body;

    // Basic validation for required fields
    if (!name || typeof name !== "string" || name.trim() === "") {
      return handleApiError(new Error("Role name is required and must be a non-empty string."), "create role", 400);
    }

    // Check if role with same name already exists
    const existingRole = await prisma.role.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } }, // Trim name for consistency
    });

    if (existingRole) {
      return handleApiError(new Error("A role with this name already exists."), "create role", 409);
    }

    const newRole = await prisma.role.create({
      data: {
        name: name.trim(), // Store trimmed name
        status: status ?? 1, // Default to 1 if status is not provided
      },
    });

    return NextResponse.json(newRole, { status: 201 }); // 201 Created for successful creation
  } catch (error: any) {
    return handleApiError(error, "create role");
  }
}

// Handles PUT (update role)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, status } = body;

    // Validate ID using helper
    const validation = validateId(id, "Role ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const roleId = validation.id; // Use validated ID

    // Basic validation for name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return handleApiError(new Error("Role name is required and must be a non-empty string."), "update role", 400);
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }, // Use validated ID
    });

    if (!existingRole) {
      return handleApiError(new Error("Role not found."), "update role", 404);
    }

    // Check if another role with the same name exists (case-insensitive, excluding current role)
    const duplicateRole = await prisma.role.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        id: { not: roleId } // Exclude the current role by its validated ID
      },
    });

    if (duplicateRole) {
      return handleApiError(new Error("Another role with this name already exists."), "update role", 409);
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId }, // Use validated ID
      data: {
        name: name.trim(), // Store trimmed name
        status: status !== undefined ? status : existingRole.status, // Preserve existing status if not provided
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error: any) {
    return handleApiError(error, "update role");
  }
}

// Handles DELETE (delete role)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    // Validate ID using helper
    const validation = validateId(id, "Role ID");
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const roleId = validation.id; // Use validated ID

    // Check if role exists (handle 404 before attempting delete)
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return handleApiError(new Error("Role not found."), "delete role", 404);
    }

    // If you have a User model or similar linked to Role, uncomment and adapt
    // to prevent deleting roles assigned to users.
    /*
    const usersWithRole = await prisma.user.count({ // Using count is more efficient than findMany
      where: { roleId: roleId },
    });

    if (usersWithRole > 0) {
      return handleApiError(
        new Error(`Cannot delete role. It is assigned to ${usersWithRole} user(s).`),
        "delete role",
        409 // Conflict status code
      );
    }
    */

    const deletedRole = await prisma.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json(deletedRole);
  } catch (error: any) {
    // handleApiError will catch P2025 (record not found) and P2003 (foreign key constraint)
    return handleApiError(error, "delete role");
  }
}