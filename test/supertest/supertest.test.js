import { expect } from 'chai';
import supertest from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import usersRouter from '../../src/routes/users.router.js';
import petsRouter from '../../src/routes/pets.router.js';
import adoptionsRouter from '../../src/routes/adoption.router.js';
import sessionsRouter from '../../src/routes/sessions.router.js';
import mocksRouter from '../../src/routes/mocks.router.js';
import { usersService, petsService, adoptionsService } from '../../src/services/index.js';

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
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@test.com',
        password: 'password123',
        role: 'user',
        pets: []
    }
};

const mockPets = {
    validPet: {
        name: 'Buddy',
        specie: 'Dog',
        birthDate: new Date('2020-01-15'),
        adopted: false
    }
};

const createUserWithHashedPassword = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return {
        ...userData,
        password: hashedPassword
    };
};

const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.use('/api/users', usersRouter);
    app.use('/api/pets', petsRouter);
    app.use('/api/adoptions', adoptionsRouter);
    app.use('/api/sessions', sessionsRouter);
    app.use('/api/mocks', mocksRouter);

    app.use((err, req, res, next) => {
        res.status(500).json({ status: 'error', error: err.message });
    });

    return app;
};

describe('Pruebas con Supertest - API', function() {
    let app;
    let request;
    let testUserId;
    let testUser;

    before(async function() {
        this.timeout(10000);
        await connectTestDB();
        app = createTestApp();
        request = supertest(app);
    });

    beforeEach(async function() {
        await clearTestDB();

        const uniqueEmail = `supertest-${Date.now()}@test.com`;
        const hashedUser = await createUserWithHashedPassword({
            ...mockUsers.validUser,
            email: uniqueEmail
        });
        testUser = await usersService.create(hashedUser);
        testUserId = testUser._id.toString();
    });

    after(async function() {
        await clearTestDB();
        await disconnectTestDB();
    });

    it('GET /api/users debería responder con status success', async function() {
        const response = await request
            .get('/api/users')
            .expect(200);

        expect(response.body).to.have.property('status', 'success');
        expect(response.body.payload).to.be.an('array');
    });

    it('PUT /api/users/:uid debería actualizar el usuario', async function() {
        const response = await request
            .put(`/api/users/${testUserId}`)
            .send({ first_name: 'Nombre Actualizado' })
            .expect(200);

        expect(response.body).to.have.property('status', 'success');
        expect(response.body.message).to.equal('User updated');
    });

    it('GET /api/adoptions debería devolver una lista vacía cuando no hay adopciones', async function() {
        const response = await request
            .get('/api/adoptions')
            .expect(200);

        expect(response.body).to.deep.equal({ status: 'success', payload: [] });
    });

    it('POST /api/adoptions/:uid/:pid debería adoptar una mascota disponible', async function() {
        const pet = await petsService.create({
            ...mockPets.validPet,
            name: 'SupertestPet',
            birthDate: new Date('2020-05-05'),
            adopted: false
        });

        const response = await request
            .post(`/api/adoptions/${testUserId}/${pet._id.toString()}`)
            .expect(200);

        expect(response.body).to.have.property('status', 'success');
        expect(response.body.message).to.equal('Pet adopted');
    });

    it('GET /api/adoptions debería listar las adopciones creadas', async function() {
        const pet = await petsService.create({
            ...mockPets.validPet,
            name: 'ListPet',
            birthDate: new Date('2021-01-01'),
            adopted: false
        });

        await request
            .post(`/api/adoptions/${testUserId}/${pet._id.toString()}`)
            .expect(200);

        const response = await request
            .get('/api/adoptions')
            .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.be.an('array');
        expect(response.body.payload.length).to.equal(1);
        expect(response.body.payload[0].owner.toString()).to.equal(testUserId);
    });

    it('GET /api/adoptions/:aid debería devolver la adopción solicitada', async function() {
        const pet = await petsService.create({
            ...mockPets.validPet,
            name: 'DetailPet',
            birthDate: new Date('2022-03-03'),
            adopted: false
        });

        await request
            .post(`/api/adoptions/${testUserId}/${pet._id.toString()}`)
            .expect(200);

        const adoptions = await adoptionsService.getAll();
        const adoptionId = adoptions[0]._id.toString();

        const response = await request
            .get(`/api/adoptions/${adoptionId}`)
            .expect(200);

        expect(response.body.status).to.equal('success');
        expect(response.body.payload.owner.toString()).to.equal(testUserId);
        expect(response.body.payload.pet.toString()).to.equal(pet._id.toString());
    });

    it('GET /api/adoptions/:aid debería responder 404 si la adopción no existe', async function() {
        const nonExistingId = new mongoose.Types.ObjectId().toString();

        const response = await request
            .get(`/api/adoptions/${nonExistingId}`)
            .expect(404);

        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('Adoption not found');
    });

    it('POST /api/adoptions/:uid/:pid debería fallar cuando la mascota ya está adoptada', async function() {
        const pet = await petsService.create({
            ...mockPets.validPet,
            name: 'DuplicatePet',
            birthDate: new Date('2019-07-07'),
            adopted: false
        });

        await request
            .post(`/api/adoptions/${testUserId}/${pet._id.toString()}`)
            .expect(200);

        const response = await request
            .post(`/api/adoptions/${testUserId}/${pet._id.toString()}`)
            .expect(400);

        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('Pet is already adopted');
    });

    it('POST /api/adoptions/:uid/:pid debería responder 404 cuando el usuario no existe', async function() {
        const pet = await petsService.create({
            ...mockPets.validPet,
            name: 'MissingUserPet',
            birthDate: new Date('2020-12-12'),
            adopted: false
        });

        const fakeUserId = new mongoose.Types.ObjectId().toString();

        const response = await request
            .post(`/api/adoptions/${fakeUserId}/${pet._id.toString()}`)
            .expect(404);

        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('user Not found');
    });

    it('POST /api/adoptions/:uid/:pid debería responder 404 cuando la mascota no existe', async function() {
        const fakePetId = new mongoose.Types.ObjectId().toString();

        const response = await request
            .post(`/api/adoptions/${testUserId}/${fakePetId}`)
            .expect(404);

        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('Pet not found');
    });
});
