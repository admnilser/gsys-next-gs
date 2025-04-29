import {
	type IconProps as TablerIconProps,
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
	IconBrandFacebook,
	IconKey,
	IconMail,
	IconDashboard,
	IconUsersGroup,
	IconBox,
	IconPackages,
	IconFloatNone,
	IconCashRegister,
	IconBuildingBank,
	IconWallet,
	IconTools,
	IconCalendar,
	IconFolder,
	IconArchive,
	IconTrolley,
	IconCoin,
	IconSquareX,
	IconTag,
	IconTrash,
	IconFile,
	IconSearch,
	IconChevronUp,
} from "@tabler/icons-react";

export type IconName =
	| "archive"
	| "ban"
	| "bank"
	| "box"
	| "boxes"
	| "calendar"
	| "cash"
	| "chat"
	| "chevronDown"
	| "chevronUp"
	| "chevronRight"
	| "coin"
	| "dashboard"
	| "dolly"
	| "facebook"
	| "file"
	| "filter"
	| "folder"
	| "google"
	| "home"
	| "key"
	| "lock"
	| "logout"
	| "mail"
	| "more"
	| "none"
	| "pencil"
	| "plus"
	| "profile"
	| "save"
	| "search"
	| "setup"
	| "star"
	| "tag"
	| "times"
	| "tools"
	| "trash"
	| "user"
	| "users"
	| "wallet";

export interface IconProps extends TablerIconProps {
	name: IconName;
}

const Icons: Record<IconName, React.FC<TablerIconProps>> = {
	archive: IconArchive,
	ban: IconBan,
	bank: IconBuildingBank,
	box: IconBox,
	boxes: IconPackages,
	calendar: IconCalendar,
	cash: IconCashRegister,
	chat: IconBrandWhatsapp,
	chevronDown: IconChevronDown,
	chevronRight: IconChevronRight,
	chevronUp: IconChevronUp,
	coin: IconCoin,
	dashboard: IconDashboard,
	dolly: IconTrolley,
	facebook: IconBrandFacebook,
	file: IconFile,
	filter: IconFilter,
	folder: IconFolder,
	google: IconBrandGoogle,
	home: IconHome,
	key: IconKey,
	lock: IconLock,
	logout: IconLogout,
	mail: IconMail,
	more: IconDotsVertical,
	none: IconFloatNone,
	pencil: IconPencil,
	plus: IconPlus,
	profile: IconUser,
	save: IconDeviceFloppy,
	search: IconSearch,
	setup: IconSettingsUp,
	star: IconStar,
	tag: IconTag,
	times: IconSquareX,
	tools: IconTools,
	trash: IconTrash,
	user: IconUser,
	users: IconUsersGroup,
	wallet: IconWallet,
};

export function Icon({ name, stroke = 1.5, ...rest }: IconProps) {
	const Icon = Icons[name];
	return <Icon {...rest} stroke={stroke} />;
}
