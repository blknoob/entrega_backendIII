import { Router } from "express";
import { generateMockUsers, generateMockPets } from "../utils/mockingModule.js";
import { usersService, petsService } from "../services/index.js";

const router = Router();

router.get("/mockingpets", async (req, res) => {
  try {
    const numPets = req.query.num || 10;
    const mockPets = generateMockPets(parseInt(numPets));

    res.send({
      status: "success",
      message: `${numPets} mascotas creadas exitosamente`,
      payload: mockPets,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      error: "Error al crear mascotas mock",
    });
  }
});

router.get("/mockingusers", async (req, res) => {
  try {
    const mockUsers = await generateMockUsers(50);

    res.send({
      status: "success",
      message: "50 usuarios creados exitosamente",
      payload: mockUsers,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      error: "Error al crear usuarios mock",
    });
  }
});

router.post("/generateData", async (req, res) => {
  try {
    const { users = 0, pets = 0 } = req.body;

    if (!users && !pets) {
      return res.status(400).send({
        status: "error",
        error: "Otorgar al menos un parámetro: users o pets",
      });
    }

    let insertedUsers = [];
    let insertedPets = [];

    if (users > 0) {
      const mockUsers = await generateMockUsers(parseInt(users));

      for (const user of mockUsers) {
        try {
          const insertedUser = await usersService.create(user);
          insertedUsers.push(insertedUser);
        } catch (error) {
          const newEmail = `${user.first_name.toLowerCase()}.${user.last_name.toLowerCase()}.${Date.now()}`;
          const userWithNewEmail = { ...user, email: newEmail };
          const insertedUser = await usersService.create(userWithNewEmail);
          insertedUsers.push(insertedUser);
        }
      }
    }

    if (pets > 0) {
      const mockPets = generateMockPets(parseInt(pets));

      for (const pet of mockPets) {
        const insertedPet = await petsService.create(pet);
        insertedPets.push(insertedPet);
      }
    }

    res.send({
      status: "success",
      message: `Datos agregados exitosamente: ${insertedUsers.length} usuarios y ${insertedPets.length} mascotas`,
      payload: {
        users: insertedUsers,
        pets: insertedPets,
      },
    });
  } catch (error) {
    console.error("Error en /generateData:", error);
    res.status(500).send({
      status: "error",
      error: "Error al incluir datos en la base de datos",
    });
  }
});

export default router;
