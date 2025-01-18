export interface ResourceParseResult<T> {
  parsed?: Partial<T>;
  errors?: Record<keyof T, string>;
}

export interface ResourceTitle {
  singular: string;
  plural: string;
}

export interface Resource<T> {
  name: string;
  title: ResourceTitle;
  role: string;
  nameField: string;
  termFields?: string[];
  parse: (data: Partial<T>) => ResourceParseResult<T>;
}
