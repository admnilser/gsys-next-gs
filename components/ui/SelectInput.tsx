import { Select, SelectProps } from "@mantine/core";

export type ComboInputValue = number | string;

export interface ComboInputProps<T = ComboInputValue>
  extends Omit<SelectProps, "value" | "onChange"> {
  items: T[];
  parse?: (item: T) => string;
  format?: (value: string) => T;
  value: T;
  onChange: (value: T) => void;
}

export function ComboInput<T>({
  items,
  value,
  parse,
  format,
  onChange,
  ...props
}: ComboInputProps<T>) {
  const parseItem = (item: T) =>
    item ? (parse ? parse(item) : item.toString()) : "";

  const formatItem = (item: string) => (format ? format(item) : (item as T));

  return (
    <Select
      data={items.map((item) => parseItem(item))}
      value={parseItem(value)}
      onChange={(val) => {
        if (onChange && val) onChange(formatItem(val));
      }}
      {...props}
    />
  );
}
