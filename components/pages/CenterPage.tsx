"use client";

import React from "react";

import { Container, Paper } from "@mantine/core";

import styles from "./CenterPage.module.css";

export interface CenterPageProps {
  children: React.ReactNode;
}

export function CenterPage({ children }: CenterPageProps) {
  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>{children}</Paper>
    </Container>
  );
}
