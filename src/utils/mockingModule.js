import bcrypt from "bcrypt";

const generateEmail = (firstName, lastName) => {
  const domains = ["gmail.com", "hotmail.com"];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomDomain}`;
};

const generateFirstName = () => {
  const names = [
    "Ana",
    "María",
    "Carlos",
    "José",
    "Luis",
    "Carmen",
    "Antonio",
    "Manuel",
    "Francisco",
    "David",
    "Jorge",
    "Miguel",
    "Rafael",
    "Pedro",
    "Daniel",
    "Alejandro",
    "Fernando",
    "Eduardo",
    "Sergio",
    "Andrés",
    "Roberto",
    "Juan",
    "Diego",
    "Pablo",
    "Javier",
    "Santiago",
    "Álvaro",
    "Adrián",
    "Sofía",
    "Isabella",
    "Valentina",
    "Camila",
    "Valeria",
    "Mariana",
    "Gabriela",
    "Daniela",
    "Victoria",
    "Alejandra",
    "Natalia",
    "Paola",
  ];
  return names[Math.floor(Math.random() * names.length)];
};

const generateLastName = () => {
  const surnames = [
    "García",
    "Rodríguez",
    "González",
    "Fernández",
    "López",
    "Martínez",
    "Sánchez",
    "Pérez",
    "Martín",
    "Gómez",
    "Ruiz",
    "Díaz",
    "Hernández",
    "Álvarez",
    "Jiménez",
    "Moreno",
    "Romero",
    "Navarro",
    "Gutiérrez",
    "Torres",
    "Domínguez",
    "Vázquez",
    "Ramos",
    "Gil",
    "Ramírez",
    "Serrano",
    "Blanco",
    "Suárez",
    "Molina",
    "Morales",
    "Ortega",
  ];
  return surnames[Math.floor(Math.random() * surnames.length)];
};

const generatePetName = () => {
  const petNames = [
    "Max",
    "Bella",
    "Charlie",
    "Luna",
    "Rocky",
    "Lucy",
    "Cooper",
    "Daisy",
    "Milo",
    "Lola",
    "Buddy",
    "Sadie",
    "Tucker",
    "Molly",
    "Oliver",
    "Sophie",
    "Bear",
    "Chloe",
    "Jack",
    "Zoe",
    "Duke",
    "Lily",
    "Toby",
    "Penny",
    "Zeus",
    "Nala",
    "Leo",
    "Ruby",
    "Simba",
    "Maya",
    "Rex",
    "Coco",
  ];
  return petNames[Math.floor(Math.random() * petNames.length)];
};

const generatePetSpecie = () => {
  const species = ["Perro", "Gato", "Conejo", "Pájaro", "Pez"];
  return species[Math.floor(Math.random() * species.length)];
};

const generateRandomBirthDate = () => {
  const start = new Date(2018, 0, 1);
  const end = new Date(2023, 11, 31);
  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return randomDate;
};

export const generateMockUsers = async (numUsers) => {
  const users = [];
  const hashedPassword = await bcrypt.hash("coder123", 10);

  for (let i = 0; i < numUsers; i++) {
    const firstName = generateFirstName();
    const lastName = generateLastName();
    const email = generateEmail(firstName, lastName);
    const role = Math.random() < 0.5 ? "user" : "admin";

    const user = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashedPassword,
      role: role,
      pets: [],
    };

    users.push(user);
  }

  return users;
};

export const generateMockPets = (numPets) => {
  const pets = [];

  for (let i = 0; i < numPets; i++) {
    const pet = {
      name: generatePetName(),
      specie: generatePetSpecie(),
      birthDate: generateRandomBirthDate(),
      adopted: false,
      image: null,
    };

    pets.push(pet);
  }

  return pets;
};
