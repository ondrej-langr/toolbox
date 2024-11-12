export type MaybePromise<T extends any> =
  | Promise<T>
  | T;
