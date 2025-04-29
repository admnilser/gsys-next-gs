import fn from "./funcs";

export type EnumValue = string | number;

export interface IEnumItem<V extends EnumValue> {
  key: string;
  text: string;
  value?: V;
  icon?: string;
  color?: string;
}

export class EnumItem<V extends EnumValue> {
  constructor(
    public key: string,
    public value: V,
    public text: string,
    public icon?: string,
    public color?: string,
  ) { }

  inset(value: V) {
    if (typeof this.value === "number") {
      return ((value as number) & this.value) !== 0;
    }
    return this.value.includes(value as string);
  }
}

export type EnumItems<V extends EnumValue> = Record<string, Omit<IEnumItem<V>, "key">>;

export class Enum<V extends EnumValue> {
  readonly items: EnumItem<V>[];
  readonly values: Record<V, EnumItem<V>>;

  constructor(items: EnumItems<V>) {
    const keys = Object.keys(items);

    this.items = [];
    this.values = {} as Record<V, EnumItem<V>>;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      const { value, text, icon, color } = items[key];

      const val = (value || i) as V;

      const item = new EnumItem<V>(key, val, text, icon, color);

      this.items.push(item);

      this.values[val] = item;

      Object.defineProperty(this, key, {
        value: item,
        writable: false,
        enumerable: true, // Aparece em loops
      });
    }
  }

  find(value: V) {
    return this.values[value];
  }
}

export type EnumType<V extends EnumValue> = Enum<V> & Record<string, EnumItem<V>>;

export function createEnum<V extends EnumValue>(items: EnumItems<V>) {
  return new Enum(items) as unknown as EnumType<V>;
}
