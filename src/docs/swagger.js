import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadSpec = (file) => YAML.load(join(__dirname, file));

const baseSpec = loadSpec('./swagger.yaml');
const usersSpec = loadSpec('./swagger.users.yaml');
const petsSpec = loadSpec('./swagger.pets.yaml');

const mergeSpecs = (base, ...modules) => {
	const merged = JSON.parse(JSON.stringify(base));

	modules.forEach((spec) => {
		if (!spec) return;

		if (spec.paths) {
			merged.paths = { ...(merged.paths || {}), ...spec.paths };
		}

		if (spec.components) {
			merged.components = merged.components || {};
			Object.entries(spec.components).forEach(([section, definitions]) => {
				merged.components[section] = {
					...(merged.components[section] || {}),
					...definitions,
				};
			});
		}

		if (spec.tags) {
			const existing = merged.tags || [];
			const names = new Set(existing.map((tag) => tag.name || tag));
			const combined = [...existing];

			spec.tags.forEach((tag) => {
				const key = tag.name || tag;
				if (!names.has(key)) {
					names.add(key);
					combined.push(tag);
				}
			});

			merged.tags = combined;
		}
	});

	return merged;
};

const specs = mergeSpecs(baseSpec, usersSpec, petsSpec);

export { specs, swaggerUi };