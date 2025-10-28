import { createSettingsWindow } from "./createSettingsWindow.js";

/**
 * @param {number} duration
 */
function wait(duration) {
	/** @type {Promise<void>} */
	const promise = new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, duration);
	});
	return promise;
}

/**
 * @param {import("./SettingsManager.js").SettingsManager} settingsManager
 * @param {import("$adlad").AdLadPluginInitializeContext} adLadContext
 * @param {string} title The title text that is shown during the ad.
 */
export async function showFullScreenAd(settingsManager, adLadContext, title) {
	const muteDuration = settingsManager.getSettingValue("fullScreenAdMuteDuration");
	const pauseDuration = settingsManager.getSettingValue("fullScreenAdPauseDuration");

	const maxDuration = Math.max(muteDuration, pauseDuration);
	const minDuration = Math.min(muteDuration, pauseDuration);
	/**
	 * The time before and after the event in the middle.
	 * I.e. if muteDuration is larger, this is the time before and after the duration that needsPause is true.
	 */
	const paddingDuration = (maxDuration - minDuration) / 2;
	const muteFirst = muteDuration > pauseDuration;

	const fullScreenEl = document.createElement("div");
	fullScreenEl.style.cssText = `
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 100000;
		display: flex;
		color: white;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	`;
	document.body.appendChild(fullScreenEl);

	fullScreenEl.addEventListener("click", () => {
		createSettingsWindow(settingsManager);
	});

	const contentEl = document.createElement("div");
	fullScreenEl.appendChild(contentEl);

	const titleEl = document.createElement("h1");
	titleEl.textContent = title;
	contentEl.appendChild(titleEl);

	/**
	 * @param {string} text
	 */
	function createStateMonitor(text) {
		const el = document.createElement("p");
		el.textContent = text + ": ";
		contentEl.appendChild(el);

		const valueEl = document.createElement("span");
		el.appendChild(valueEl);

		return valueEl;
	}

	const needsPauseValue = createStateMonitor("needsPause");
	const needsMuteValue = createStateMonitor("needsMute");

	/**
	 * @param {boolean} needsPause
	 */
	function setNeedsPause(needsPause) {
		adLadContext.setNeedsPause(needsPause);
		needsPauseValue.textContent = String(needsPause);
	}

	/**
	 * @param {boolean} needsMute
	 */
	function setNeedsMute(needsMute) {
		adLadContext.setNeedsMute(needsMute);
		needsMuteValue.textContent = String(needsMute);
	}
	setNeedsPause(false);
	setNeedsMute(false);

	muteFirst ? setNeedsMute(true) : setNeedsPause(true);

	await wait(paddingDuration);

	muteFirst ? setNeedsPause(true) : setNeedsMute(true);

	await wait(minDuration);

	muteFirst ? setNeedsPause(false) : setNeedsMute(false);

	await wait(paddingDuration);

	muteFirst ? setNeedsMute(false) : setNeedsPause(false);

	fullScreenEl.remove();
}
