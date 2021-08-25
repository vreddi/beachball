type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function | undefined ? K : never;
}[keyof T];

// Date is not actually immutable, but applying the helper to it doesn't work well
export type Immutable<T> = T extends string | number | boolean | undefined | null | Date
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<Immutable<U>>
  : T extends Map<infer U, infer V>
  ? ReadonlyMap<Immutable<U>, Immutable<V>>
  : T extends Set<infer U>
  ? ReadonlySet<Immutable<U>>
  : T extends Promise<infer U>
  ? Promise<Immutable<U>>
  : T extends {}
  ? /* Mix function properties back in as-is (don't try to make arguments and returns immutable) */ {
      readonly [P in keyof T]: P extends FunctionPropertyNames<T> ? T[P] : Immutable<T[P]>;
    }
  : Readonly<T>;

export type Mutable<T> = T extends string | number | boolean | undefined | null | Date
  ? T
  : T extends ReadonlyArray<infer U>
  ? Array<Mutable<U>>
  : T extends ReadonlyMap<infer U, infer V>
  ? Map<Mutable<U>, Mutable<V>>
  : T extends ReadonlySet<infer U>
  ? Set<Mutable<U>>
  : T extends Promise<infer U>
  ? Promise<Mutable<U>>
  : T extends {}
  ? /* Mix function properties back in as-is (don't try to make arguments and returns immutable) */ {
      -readonly [P in keyof T]: P extends FunctionPropertyNames<T> ? T[P] : Mutable<T[P]>;
    }
  : Mutable<T>;
