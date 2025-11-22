import { GraphQLError } from 'graphql';

export enum MutationErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * GraphQL mutation error with typed error code and message.
 * Extends GraphQLError to provide better TypeScript support and consistency.
 */
export class MutationError extends GraphQLError {
  readonly code: MutationErrorCode;

  constructor(code: MutationErrorCode, message: string) {
    super(message, {
      extensions: { code, message } as unknown as Record<string, unknown>
    });
    this.code = code;
    Object.setPrototypeOf(this, MutationError.prototype);
  }
}
