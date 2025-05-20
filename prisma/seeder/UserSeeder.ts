import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export class UserSeeder {
  static async seed() {
    const adminHashedPassword = await bcrypt.hash("admin123", 10);
    const clientHashedPassword = await bcrypt.hash("farmer123", 10);
    // Create the Admin role
    const adminRole = await prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: {
        name: "Admin",
        status: 1,
      },
    });
    const clientRole = await prisma.role.upsert({
      where: { name: "Client" },
      update: {},
      create: {
        name: "Client",
        status: 1,
      },
    });

    // Create the Admin user (with upsert using unique email)
    await prisma.user.upsert({
      where: { email: "admin@gmail.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@gmail.com",
        password: adminHashedPassword,
        roleId: adminRole.id,
      },
    });

    // Create additional users
    await prisma.user.createMany({
      data: [
        {
          name: "Farhan Khan",
          email: "farmer1@gmail.com",
          password: clientHashedPassword,
          roleId: clientRole.id,
        },
        {
          name: "Jane Smith",
          email: "farmer2@gmail.com",
          password: clientHashedPassword,
          roleId: clientRole.id,
        },
      ],
      skipDuplicates: true,
    });

    console.log("✅ Users seeded successfully");
  }
}
