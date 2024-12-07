# _FIRST_ LEGO League Challenge: Local Event Management System

## Contributing

LEMS is fully open source and maintained by volunteers.

💬 Feel free to join the [discussion](https://github.com/FIRSTIsrael/lems/discussions)! Submit ideas, feedback, and share your thoughts.

💻 If you can code, check out the [issues](https://github.com/FIRSTIsrael/lems/issues) tab and pick a task labelled "good first task". Submit a pull request and we will review it

🆕 Stay updated on the latest progress and release schedule from the [LEMS Github Project](https://github.com/orgs/FIRSTIsrael/projects/3).

## Running Locally

### Prerequisites

- Node 22 LTS
- Docker

### DB Setup

1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. Pull mongodb image with tag 7.0.x
   `docker pull mongo:7.0.5`

3. Run the container with an exposed port

   `docker run -d --name fll-events-local-db -p 27017:27017 mongo:7.0.5`

4. To stop the container, use either the CLI or docker desktop.
   When you stop the container without removing it, you will be unable to start a new container with the same name.
   It is encouraged to just restart the container you created instead of removing it every time.

### Start the app

#### Configure the app

Currently, LEMS uses _FIRST_ Israel's DigitalOcean file storage. Before running LEMS,
make sure to reach out to a _FIRST_ Israel contact with access for the key and secret.

Update `.env.local` with keys in place of the comments.

**Note**: LEMS will run just fine with the provided non-secret variables. Currently the functions that need secrets are for team profile documents and pit maps.

#### Running the app

To start the development server run `npm run dev`.

Frontend will be available at <http://localhost:4200/>.
Backend will be available at <http://localhost:3333/>.

Happy coding!

### CI

#### Building

`npm run build` build the entire LEMS app and stores it in the /dist folder.
`docker compose build` uses the /dist folder and builds docker images. This should only be run in CI with proper ENV vars configured.

#### Environment Variables

Environment variables and secrets are managed through GitHub.

#### Manual Configurations

##### SSL

DO Droplet uses its own certificate.
MongoDB uses a self-signed certificate, which is managed by GitHub Secrets.
Certbot manages the SSL connection cerificate to the `lems.firstisrael.org.il` domain. DNS is managed through Cloudflare, with a security edge protection proxy.

##### Nginx

We use nginx to map different paths to the services and serve the HTTP app.
