// Handles GET (fetch users) and POST (create user)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, email, password, roleName } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await prisma.role.findFirst({ where: { name: roleName } });
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
        roleId: role.id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// Handles PUT (update user)
export async function PUT(req: Request) {
  try {
    const { id, username, email, password, roleName } = await req.json();

    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const updateData: any = {
      name: username,
      email,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (roleName) {
      const role = await prisma.role.findFirst({ where: { name: roleName } });
      if (!role) {
        return NextResponse.json({ error: "Invalid role name." }, { status: 400 });
      }
      updateData.roleId = role.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}


// Handles DELETE (delete user)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json(); // expecting { id: number }

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}