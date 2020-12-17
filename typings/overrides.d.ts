/* eslint-disable @typescript-eslint/interface-name-prefix */

interface ObjectConstructor {
  hasKey<K extends string>(
    obj: any,
    k: K
  ): obj is {
    [_ in K]: unknown;
  };
}
