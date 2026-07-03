import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Casts a route handler with a narrowed request type to Express's RequestHandler.
 * Middleware upstream is responsible for populating the narrowed fields.
 */
export function asHandler<TReq extends Request>(
  handler: (req: TReq, res: Response, next?: NextFunction) => void | Promise<void>
): RequestHandler {
  return handler as RequestHandler;
}

/**
 * Casts middleware with a narrowed request type to Express's RequestHandler.
 */
export function asMiddleware<TReq extends Request>(
  middleware: (req: TReq, res: Response, next: NextFunction) => void | Promise<void>
): RequestHandler {
  return middleware as RequestHandler;
}
