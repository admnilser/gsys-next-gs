import React from "react";

import { Icon, type IconProps } from "./Icon";

import styles from "./TreeTable.module.css";

export const TreeIcon = (props: IconProps) => <Icon link {...props} />;

export type TreeTogglerProps = IconProps & {
	status: boolean;
};

const TreeToggler = ({ status, children, ...rest }: TreeTogglerProps) => (
	<div className={styles.toggler}>
		{/*status && <TreeIcon color="grey" name={`chevronUp ${status}`} {...rest} />}
		{status && <TreeIcon color="grey" name={`chevronDown ${status}`} {...rest} />}
		{children*/}
	</div>
);

export type TreeTableProps = React.PropsWithChildren & {
	list: any;
	rowMenu: any;
	rowStyle: any;
};

export class TreeTable extends React.Component {
	static Icon = TreeIcon;
	static Toggler = TreeToggler;

	constructor(props: TreeTableProps) {
		super(props);
		this.state = { activeId: null };
		this.renderRec = this.renderRec.bind(this);
		this.renderNode = this.renderNode.bind(this);
	}

	renderRec(id) {
		const {
			list: { recs },
			rowMenu,
			rowStyle,
			children,
		} = this.props;

		const rowActive = this.state.activeId == id;

		const handleRowClick = (e) => {
			const id = e.currentTarget.id;

			this.setState({ activeId: id !== this.state.activeId ? id : null });
		};

		const rec = recs[id];

		const row = rec ? (
			<SuiTable.Row
				id={id}
				active={rowActive}
				style={rowStyle && rowStyle(rec)}
				onClick={handleRowClick}
			>
				{React.Children.map(children, ({ props }, idx) => (
					<SuiTable.Cell key={idx} style={{ width: props.width }}>
						{props.render(rec)}
					</SuiTable.Cell>
				))}
			</SuiTable.Row>
		) : null;

		return (
			<>
				{row &&
					(rowMenu && rowActive ? (
						<PopupMenu
							key="rowMenu"
							data={rec}
							open={true}
							onClose={() => this.setState({})}
							trigger={row}
							items={rowMenu}
						/>
					) : (
						row
					))}
				{this.renderNode(id)}
			</>
		);
	}

	renderNode(node) {
		const {
			list: { tree },
			children,
		} = this.props;

		const opened = node === "root" || tree.open[node];

		if (!opened) return null;

		if (opened === -1)
			return <ScrollTable.Loader colSpan={React.Children.count(children)} />;

		const ids = tree.node[node];

		return ids ? _.map(ids, this.renderRec) : null;
	}

	render() {
		const { list, children, rowMenu, rowStyle, ...rest } = this.props;
		return list ? (
			<ScrollTable
				head={
					<SuiTable.Row>
						{React.Children.map(children, ({ props }, idx) => (
							<SuiTable.HeaderCell key={idx} style={{ width: props.width }}>
								{props.title}
							</SuiTable.HeaderCell>
						))}
					</SuiTable.Row>
				}
				body={this.renderNode("root")}
				compact
				unstackable
				{...rest}
			/>
		) : null;
	}
}
