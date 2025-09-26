export function SaveRestorePanel() {
	return (
		<Panel position="top-right">
			<button className="xy-theme__button" onClick={onSave}>
				save
			</button>
			<button className="xy-theme__button" onClick={onRestore}>
				restore
			</button>
			<button className="xy-theme__button" onClick={onAdd}>
				add node
			</button>
		</Panel>
	);
}
