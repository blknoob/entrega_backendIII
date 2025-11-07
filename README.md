# AdoptMe API

API REST en Node.js + Express para adopciones de mascotas.

## Requisitos
- Node.js 18+
- URI de MongoDB 

## Instalación
```bash
npm install
```

Crear un archivo `.env` con:
```env
MONGO_URI=tu_uri_de_mongo
TEST_DB_URI=tu_uri_de_mongo_test
PORT=8080
```

## Ejecución
- Desarrollo: `npm run dev`
- Producción: `npm start`

## Pruebas
```bash
npm test
```

## Documentación
Swagger en `http://localhost:8080/api-docs`

## Docker
https://hub.docker.com/r/carlosurga/adoptme-app

### Ejecutar imagen 
```bash
docker run -d --name adoptme \
	-p 8080:8080 \
	-e MONGO_URI="tu_uri_de_mongo" \
	carlosurga/adoptme-app:latest
```
La aplicación estará disponible en `http://localhost:8080`

### Construir y ejecutar localmente
```bash
docker build -t adoptme-app:local .
docker run -d --name adoptme-local \
	-p 8080:8080 \
	-e MONGO_URI="tu_uri_de_mongo" \
	adoptme-app:local
```
