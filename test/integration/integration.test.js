import { expect } from "chai";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import {
  usersService,
  petsService,
  adoptionsService,
} from "../../src/services/index.js";

dotenv.config({ quiet: true });

const TEST_DB_URI = process.env.TEST_DB_URI;

const connectTestDB = async () => {
  await mongoose.connect(TEST_DB_URI);
};

const disconnectTestDB = async () => {
  await mongoose.connection.close();
};

const clearTestDB = async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const mockUsers = {
  validUser: {
    first_name: "Juan",
    last_name: "Pérez",
    email: "juan.perez@test.com",
    password: "password123",
    role: "user",
    pets: [],
  },
  validAdmin: {
    first_name: "Admin",
    last_name: "Test",
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
    pets: [],
  },
};

const mockPets = {
  validPet: {
    name: "Buddy",
    specie: "Dog",
    birthDate: new Date("2020-01-15"),
    adopted: false,
  },
};

const createUserWithHashedPassword = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  return {
    ...userData,
    password: hashedPassword,
  };
};

describe("Pruebas de Integración - Servicios", function () {
  before(async function () {
    this.timeout(10000);
    await connectTestDB();
  });

  beforeEach(async function () {
    await clearTestDB();
  });

  after(async function () {
    await clearTestDB();
    await disconnectTestDB();
  });

  it("Debería orquestar una adopción usando los servicios", async function () {
    const uniqueEmail = `integration-${Date.now()}@test.com`;
    const userData = await createUserWithHashedPassword({
      ...mockUsers.validUser,
      email: uniqueEmail,
    });
    const user = await usersService.create(userData);

    const pet = await petsService.create({
      ...mockPets.validPet,
      name: "IntegrationPet",
      birthDate: new Date("2022-02-02"),
    });

    await usersService.update(user._id, { pets: [pet._id] });
    await petsService.update(pet._id, { adopted: true, owner: user._id });
    const adoption = await adoptionsService.create({
      owner: user._id,
      pet: pet._id,
    });

    const storedUser = await usersService.getUserById(user._id);
    const storedPet = await petsService.getBy({ _id: pet._id });
    const storedAdoptions = await adoptionsService.getAll();
    const storedAdoption = storedAdoptions.find(
      (doc) =>
        doc.owner.toString() === user._id.toString() &&
        doc.pet.toString() === pet._id.toString()
    );

    expect(adoption.owner.toString()).to.equal(user._id.toString());
    expect(storedAdoption).to.exist;
    expect(storedUser.pets.length).to.be.greaterThan(0);
    expect(storedPet.adopted).to.be.true;
    expect(storedPet.owner.toString()).to.equal(user._id.toString());
  });

  it("Debería fallar al crear usuarios con el mismo email", async function () {
    const duplicateEmail = "integration-duplicate@test.com";
    const baseUser = await createUserWithHashedPassword({
      ...mockUsers.validAdmin,
      email: duplicateEmail,
    });

    await usersService.create(baseUser);

    let error;
    try {
      await usersService.create(baseUser);
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error).to.have.property("code");
    expect(error.code).to.equal(11000);
  });
});
