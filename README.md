# Lems

FIRST LEGO League Challenge: Local Event Management System

## DB Setup

1. Download [docker desktop](https://www.docker.com/products/docker-desktop/)

2. Pull mongodb image with tag 7.0.x
   `docker pull mongo:7.0.0`

3. Run the container with an exposed port

   `docker run -d --name fll-events-local-db -p 27017:27017 mongo:7.0.0`

4. To stop the container, use either the CLI or docker desktop.
   When you stop the container without removing it, you will be unable to start a new container with the same name.
   It is encouraged to just restart the container you created instead of removing it every time.

## Start the app

### Configure the app

Currently, LEMS uses _FIRST_ Israel's DigitalOcean file storage. Before running LEMS,
make sure to reach out to a _FIRST_ Israel contact with access for the key and secret.

Update `.env.local` with keys in place of the comments.

### Running the app

To start the development server run `npm run dev`.

Frontend will be available at <http://localhost:4200/>.
Backend will be available at <http://localhost:3333/>.

Happy coding!

## CI

### Building

`npm run build` build the entire LEMS app and stores it in the /dist folder.
`docker compose build` uses the /dist folder and builds docker images. This should only be run in CI with proper ENV vars configured.

### Environment variables

Build-time environment variables and secrets are managed through Github.
Variables are located in the .env.production files.
