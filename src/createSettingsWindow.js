/**
 * @param {import("./SettingsManager.js").SettingsManager} manager
 */
export function createSettingsWindow(manager) {
	const w = window.open("about:blank");

	if (!w) {
		const dialog = document.createElement("dialog");
		dialog.id = "adladSettingsPopover";
		dialog.innerHTML = `<h1>Failed to create settings window</h1>
		<p>Please allow pop-ups.</p>`;
		document.body.appendChild(dialog);
		dialog.showModal();
		dialog.onclose = () => {
			dialog.remove();
		};
		return;
	}

	globalThis.addEventListener("beforeunload", () => {
		w.close();
	});

	const doc = w.document;

	const titleEl = doc.createElement("title");
	titleEl.textContent = "AdLad Settings";
	doc.head.appendChild(titleEl);

	const style = doc.createElement("style");
	style.textContent = `
	html {
		font-family: Arial, Helvetica, sans-serif;
	}

	.container {
		display: flex;
		gap: 20px;
		flex-direction: column;
	}

	.description {
		color: #4f4f4f;
		font-size: 10pt;
		margin: 3px 0;
	}
	`;
	doc.head.appendChild(style);

	const settingsContainer = doc.createElement("div");
	settingsContainer.classList.add("container");
	doc.body.appendChild(settingsContainer);

	for (const [key, config] of Object.entries(manager.settings)) {
		const settingId = /** @type {import("./SettingsManager.js").SettingIds} */ (key);
		const settingContainer = doc.createElement("div");
		settingsContainer.appendChild(settingContainer);

		const label = doc.createElement("label");
		label.textContent = config.label + " ";
		settingContainer.appendChild(label);

		let inputEl;
		if (config.type == "number") {
			inputEl = doc.createElement("input");
			inputEl.type = "number";
		} else if (config.type == "enum") {
			inputEl = doc.createElement("select");
			if (config.options) {
				for (const option of config.options) {
					const el = doc.createElement("option");
					el.textContent = option;
					el.value = option;
					inputEl.appendChild(el);
				}
			}
		} else {
			const unknownConfig = /** @type {{type: string}} */ (config);
			throw new Error("Invalid setting type: " + unknownConfig.type);
		}
		const certainInputEl = inputEl;
		const value = manager.getSettingValue(settingId);
		inputEl.value = String(value);

		inputEl.addEventListener("change", () => {
			let value;
			if (config.type == "number") {
				value = parseInt(certainInputEl.value);
			} else if (config.type == "enum") {
				value = certainInputEl.value;
			} else {
				throw new Error("Unexpected setting type");
			}
			manager.setValue(settingId, value);
		});

		const descriptionEl = doc.createElement("p");
		descriptionEl.classList.add("description");
		descriptionEl.innerHTML = config.description.replaceAll("\n", "<br>");
		settingContainer.appendChild(descriptionEl);

		label.appendChild(inputEl);
	}
}
