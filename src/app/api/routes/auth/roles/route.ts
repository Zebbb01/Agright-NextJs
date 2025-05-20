import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    // If ID is provided, return a single role
    if (id) {
      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        return NextResponse.json(
          { error: "Invalid role ID" },
          { status: 400 }
        );
      }
      
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });
      
      if (!role) {
        return NextResponse.json(
          { error: "Role not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(role);
    }
    
    // Otherwise return all roles
    const roles = await prisma.role.findMany({
      orderBy: { id: "asc" },
    });
    
    return NextResponse.json(roles);
  } catch (error) {
    console.error("GET roles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, status } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Role name is required and must be a string." },
        { status: 400 }
      );
    }

    // Check if role with same name already exists
    const existingRole = await prisma.role.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "A role with this name already exists." },
        { status: 409 }
      );
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        status: status ?? 1,
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("POST roles error:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}

// Handles PUT (update role)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, status } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Role ID is required and must be a number." },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Role name is required and must be a string." },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found." },
        { status: 404 }
      );
    }

    // Check if another role with the same name exists
    const duplicateRole = await prisma.role.findFirst({
      where: { 
        name: { equals: name, mode: 'insensitive' },
        id: { not: id }
      },
    });

    if (duplicateRole) {
      return NextResponse.json(
        { error: "Another role with this name already exists." },
        { status: 409 }
      );
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        status: status !== undefined ? status : existingRole.status,
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("PUT roles error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// Handles DELETE (delete role)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Role ID is required and must be a number." },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found." },
        { status: 404 }
      );
    }

    // Check if role is assigned to any users
    // Assuming you have a UserRole model or similar
    // Uncomment and adapt this code if you have such relations
    /*
    const usersWithRole = await prisma.userRole.findMany({
      where: { roleId: id },
    });

    if (usersWithRole.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete role. It is assigned to users.",
          count: usersWithRole.length 
        },
        { status: 409 }
      );
    }
    */

    const deletedRole = await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json(deletedRole);
  } catch (error) {
    console.error("DELETE roles error:", error);
    
    // Check for foreign key violation errors
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === 'P2003') {
      return NextResponse.json(
        { error: "Cannot delete role because it is referenced by other records." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}