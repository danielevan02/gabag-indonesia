import { PrismaClient } from "@prisma/client";
import { sample } from "./sample-data";
import { hashSync } from "bcrypt-ts-edge";

async function main() {
  const prisma = new PrismaClient()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  await prisma.category.createMany({
    data: sample.category
  })

  await prisma.product.createMany({
    data: sample.product
  })

  await prisma.user.create({
    data: {
      email: "daniel@gmail.com",
      password: hashSync("123456", 10),
      name: "Daniel Laventiza",
      role: "user"
    }
  })
  
  console.log("Database seeded successfully")  
}

main();