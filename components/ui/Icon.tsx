import {
  IconProps as TablerIconProps,
  IconHome,
  IconUser,
  IconLock,
  IconBrandGoogle,
  IconBan,
  IconBrandWhatsapp,
  IconSettingsUp,
  IconChevronRight,
  IconLogout,
  IconChevronDown,
  IconPlus,
  IconFilter,
  IconDeviceFloppy,
  IconDotsVertical,
  IconStar,
  IconPencil,
} from "@tabler/icons-react";

export type IconName =
  | "home"
  | "user"
  | "lock"
  | "google"
  | "ban"
  | "chat"
  | "setup"
  | "chevronRight"
  | "chevronDown"
  | "logout"
  | "profile"
  | "plus"
  | "filter"
  | "save"
  | "more"
  | "star"
  | "pencil";

export interface IconProps extends TablerIconProps {
  name: IconName;
}

const Icons: Record<IconName, React.FC<TablerIconProps>> = {
  home: IconHome,
  user: IconUser,
  lock: IconLock,
  ban: IconBan,
  google: IconBrandGoogle,
  chat: IconBrandWhatsapp,
  setup: IconSettingsUp,
  chevronRight: IconChevronRight,
  chevronDown: IconChevronDown,
  logout: IconLogout,
  profile: IconUser,
  plus: IconPlus,
  filter: IconFilter,
  save: IconDeviceFloppy,
  more: IconDotsVertical,
  star: IconStar,
  pencil: IconPencil,
};

export function Icon({ name, stroke = 1.5, ...rest }: IconProps) {
  const Icon = Icons[name];
  return <Icon {...rest} stroke={stroke} />;
}
