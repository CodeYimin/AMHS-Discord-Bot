export type UnionToIntersect<T> = (
  T extends T ? (a: T) => void : never
) extends (a: infer I) => void
  ? I
  : never;

export type RequirePicked<T, P extends keyof T> = T & Record<P, Required<T[P]>>;
