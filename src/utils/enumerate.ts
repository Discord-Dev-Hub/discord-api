import { filter, isNumber } from 'lodash';

export function enumerate<T>(EnumDefinition: T, isNumberArray?: boolean) {
  try {
    const values = Object.values(EnumDefinition);

    if (isNumberArray) {
      return filter(values, (value) => isNumber(value));
    }

    return values;
  } catch (e) {
    return [];
  }
}
