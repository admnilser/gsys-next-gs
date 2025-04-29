import React from "react";

import { Header, Menu, Image } from "semantic-ui-react";

import { SideBar, Company } from "ui/layout";

import { Button } from "ui";

import _ from "utils";

import useNavApp from "../useNavApp";

const SideBarHeader = () => {
  const {
    profile,
    company,
    setCompany,
    auth: {
      user: { USER_NAME, USER_SHOP },
      logout,
    },
  } = useNavApp();

  return (
    <>
      <Image
        src={profile.logo}
        size="tiny"
        style={{
          backgroundColor: "#fff",
          padding: 10,
          marginTop: 20,
        }}
        centered
        circular
      />
      <Company
        context="sidebar"
        disabled={_.notNoU(USER_SHOP)}
        value={company}
        onChange={setCompany}
      />
      <Menu.Item header>
        <Header as="h5" inverted>
          Usuário: {USER_NAME}
        </Header>
        <Button
          content="Sair"
          icon="power off"
          onClick={() => logout()}
          basic
          inverted
        />
      </Menu.Item>
    </>
  );
};

const AppSideBar = (props) => <SideBar header={<SideBarHeader />} {...props} />;

export default AppSideBar;
