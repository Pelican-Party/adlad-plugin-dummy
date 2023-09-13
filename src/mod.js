import { SettingsManager } from "./SettingsManager.js";
import { showFullScreenAd } from "./showFullScreenAd.js";

export function dummyPlugin() {
	const settingsManager = new SettingsManager();

	/** @type {import("$adlad").AdLadPluginInitializeContext} */
	let adLadContext;

	// @ts-ignore Untyped global function
	globalThis.configureAdLad = () => {
		settingsManager.openSettingsWindow();
	};

	/**
	 * @param {import("./SettingsManager.js").SettingIds} settingId
	 * @returns {import("$adlad").ShowFullScreenAdResult}
	 */
	function getFullScreenAdResult(settingId) {
		const setting = settingsManager.getSettingValue(settingId);
		if (typeof setting != "string") {
			throw new Error("Assertion failed, setting is not a string");
		}
		const desiredResult = /** @type {import("./SettingsManager.js").ShowAdResultSetting} */ (setting);
		if (desiredResult == "success") {
			return {
				didShowAd: true,
				errorReason: null,
			};
		} else {
			return {
				didShowAd: false,
				errorReason: desiredResult,
			};
		}
	}

	let lastShowAdTime = performance.now();

	const plugin = /** @type {const} @satisfies {import("$adlad").AdLadPlugin} */ ({
		name: "dummy",
		manualNeedsMute: true,
		manualNeedsPause: true,
		initialize(ctx) {
			adLadContext = ctx;
		},
	});
	const castPlugin = /** @type {import("$adlad").AdLadPlugin} */ (plugin);

	if (settingsManager.getSettingValue("showFullScreenAdResult") != "not-supported") {
		castPlugin.showFullScreenAd = async () => {
			if (
				performance.now() - lastShowAdTime <
					settingsManager.getSettingValue("fullScreenAdTimeConstraint") * 1000
			) {
				return {
					didShowAd: false,
					errorReason: "time-constraint",
				};
			}
			const result = getFullScreenAdResult("showFullScreenAdResult");
			if (result.didShowAd) {
				await showFullScreenAd(settingsManager, adLadContext, "Full Screen Ad");
				lastShowAdTime = performance.now();
			}
			return result;
		};
	}

	if (settingsManager.getSettingValue("showRewardedAdResult") != "not-supported") {
		castPlugin.showRewardedAd = async () => {
			const result = getFullScreenAdResult("showRewardedAdResult");
			if (result.didShowAd) {
				await showFullScreenAd(settingsManager, adLadContext, "Rewarded Ad");
				lastShowAdTime = performance.now();
			}
			return result;
		};
	}

	return plugin;
}
