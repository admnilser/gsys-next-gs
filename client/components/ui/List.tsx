import { ScrollArea, Stack, UnstyledButton } from "@mantine/core";

import styles from "./List.module.css";

export interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
}

export function List<T>({ items, renderItem, onItemClick }: ListProps<T>) {
  const itemClick = (item: T) => {
    if (onItemClick) onItemClick(item);
  };

  return (
    <ScrollArea type="hover" className="full" scrollbars="y">
      <Stack>
        {items.map((item, idx) => (
          <UnstyledButton
            className={styles.item}
            key={idx}
            onClick={() => itemClick(item)}>
            {renderItem(item)}
          </UnstyledButton>
        ))}
      </Stack>
    </ScrollArea>
  );
}
