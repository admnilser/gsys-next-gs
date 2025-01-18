import React from "react";

import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";

import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  /** Put your mantine theme override here */
});

export interface RootLayoutProps extends React.PropsWithChildren {
  title: string;
}

export function RootLayout({ title, children }: RootLayoutProps) {
  return (
    <html lang="en" data-mantine-color-scheme="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
