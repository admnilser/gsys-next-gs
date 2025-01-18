import {
  ActionIcon,
  ActionIconProps,
  Badge,
  BadgeProps,
  Button as ManButton,
  ButtonProps as ManButtonProps,
  PolymorphicComponentProps,
} from "@mantine/core";

import { Icon, IconName } from "./Icon";

import styles from "./Buttons.module.css";

export type ButtonProps<C = "button"> = PolymorphicComponentProps<
  C,
  ManButtonProps
> & {
  leftIcon?: IconName;
  rightIcon?: IconName;
  onClick?: () => void;
};

export function Button({ leftIcon, rightIcon, ...props }: ButtonProps) {
  return (
    <ManButton
      leftSection={leftIcon && <Icon name={leftIcon} />}
      rightSection={rightIcon && <Icon name={rightIcon} />}
      {...props}
    />
  );
}

export type ButtonBadgeProps = BadgeProps & {
  value: string;
};

export function ButtonBadge({
  color,
  value,
  children,
  ...props
}: ButtonBadgeProps) {
  return (
    <div className={styles.badge}>
      <Badge size="xs" color={color || "blue"} circle {...props}>
        {value}
      </Badge>
      {children}
    </div>
  );
}

Button.Badge = Badge;

export interface IconButtonProps extends ActionIconProps {
  icon: IconName;
  badge?: ButtonBadgeProps;
  onClick?: () => void;
}

export function IconButton({
  variant = "subtle",
  color = "gray",
  icon,
  badge,
  onClick,
  ...props
}: IconButtonProps) {
  const iconButton = (
    <ActionIcon {...props} {...{ variant, color }} onClick={onClick}>
      <Icon name={icon} />
    </ActionIcon>
  );

  if (badge) {
    return <ButtonBadge {...badge}>{iconButton}</ButtonBadge>;
  }

  return iconButton;
}
