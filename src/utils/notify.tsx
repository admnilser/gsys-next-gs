import { notifications } from "@mantine/notifications";

import { IconX, IconCheck, IconAlertCircle } from "@tabler/icons-react";

const notify = {
  ...notifications,
  error: (message: string | Error) => {
    notifications.show({
      title: "Erro",
      message: message instanceof Error ? message.message : message,
      color: "red",
      icon: <IconX />,
      withCloseButton: true,
    });
  },
  warn: (message: string) => {
    notifications.show({
      title: "Atenção",
      message,
      color: "yellow",
      icon: <IconAlertCircle />,
      withCloseButton: true,
    });
  },
  info: (message: string) => {
    notifications.show({
      title: "Sucesso",
      message,
      color: "green",
      icon: <IconCheck />,
      autoClose: 5000,
      withCloseButton: true,
    });
  },
};

export default notify;
