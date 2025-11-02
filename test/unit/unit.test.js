import { expect } from 'chai';
import { createHash, passwordValidation } from '../../src/utils/index.js';
import PetDTO from '../../src/dto/Pet.dto.js';
import UserDTO from '../../src/dto/User.dto.js';

describe('Pruebas Unitarias - Utilidades y DTOs', function() {
    it('createHash y passwordValidation deberían trabajar juntos correctamente', async function() {
        const password = 'Secret123!';
        const hashedPassword = await createHash(password);

        expect(hashedPassword).to.be.a('string');
        expect(hashedPassword).to.not.equal(password);

        const isValid = await passwordValidation({ password: hashedPassword }, password);
        expect(isValid).to.be.true;
    });

    it('PetDTO.getPetInputFrom debería aplicar valores por defecto', function() {
        const dto = PetDTO.getPetInputFrom({
            name: 'Rex',
            specie: 'Dog'
        });

        expect(dto.name).to.equal('Rex');
        expect(dto.specie).to.equal('Dog');
        expect(dto.birthDate).to.equal('12-30-2000');
        expect(dto.adopted).to.be.false;
    });

    it('UserDTO.getUserTokenFrom debería mapear propiedades correctamente', function() {
        const dto = UserDTO.getUserTokenFrom({
            first_name: 'Ana',
            last_name: 'García',
            role: 'admin',
            email: 'ana@test.com'
        });

        expect(dto).to.deep.equal({
            name: 'Ana García',
            role: 'admin',
            email: 'ana@test.com'
        });
    });
});
