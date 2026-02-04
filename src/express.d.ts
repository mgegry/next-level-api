declare module 'express' {
  interface Request {
    user?: unknown;
  }
}

export {};
