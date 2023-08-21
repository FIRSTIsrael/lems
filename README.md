# Lems

FIRST LEGO League Challenge: Local Event Management System

## DB Setup

1. Download [docker desktop](https://www.docker.com/products/docker-desktop/)

2. Pull mongodb image with tag 7.0.x
   `docker pull mongo:7.0.0`

3. Run the container with an exposed port

`docker run -d --name fll-events-local-db -p 27017:27017 mongo:5.0.18`

4. To stop the container, use either the CLI or docker desktop.
   When you stop the container without removing it, you will be unable to start a new container with the same name.
   It is encouraged to just restart the container you created instead of removing it every time.

## Start the app

To start the development server run `npm run dev`.

Frontend will be available at http://localhost:4200/.
Backend will be available at http://localhost:3000/.

Happy coding!

## Ready to deploy?

Just run `nx build lems` to build the application. The build artifacts will be stored in the `dist/` directory, ready to be deployed.

## Set up CI!

Nx comes with local caching already built-in (check your `nx.json`). On CI you might want to go a step further.

- [Learn more how to setup CI](https://nx.dev/recipes/ci)
