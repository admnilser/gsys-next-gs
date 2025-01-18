import { Group, GroupProps, Pagination, Text } from "@mantine/core";

import { Entity, EntityService } from "../../model/entity";

import { ComboInput } from "../ui/SelectInput";

import styles from "./EntityPager.module.css";

export interface PagerProps<E extends Entity> extends GroupProps {
  service: EntityService<E>;
}

export function EntityPager<E extends Entity>({
  service,
  ...props
}: PagerProps<E>) {
  return (
    <Group justify="space-between" {...props}>
      <Text component={Group} className={styles.pageSize} gap={5} fz="sm">
        <span>Exibir</span>
        <ComboInput<number>
          w={80}
          items={[10, 20, 50, 100]}
          value={service.pager.pageSize}
          onChange={(pageSize) => service.navigate({ pageSize })}
          allowDeselect={false}
        />
        <span>registro(s)</span>
      </Text>
      <Pagination
        value={service.pager.page}
        total={service.pager.pageCount}
        onChange={(page) => service.navigate({ page })}
      />
    </Group>
  );
}
