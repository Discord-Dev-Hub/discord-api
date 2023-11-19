export {};

declare global {
  type Type<T> = T;

  /** Given class x. It returns the type of x.TProp inside of x */
  type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
}
