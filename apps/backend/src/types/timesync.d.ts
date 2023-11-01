declare module 'timesync/server' {
  import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
  import type { createServer as createHttpServer, Server } from 'http';
  function requestHandler(req: Request | ExpressRequest, res: Response | ExpressResponse): void;

  function createServer(): ReturnType<typeof createHttpServer>;

  function attachServer(server: Server, path?: string): void;
}
