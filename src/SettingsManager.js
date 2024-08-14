import { createSettingsWindow } from "./createSettingsWindow.js";

/**
 * @typedef {keyof SettingsManager["settings"]} SettingIds
 */

/**
 * @typedef {"success" | "user-dismissed" | "adblocker" | "not-supported" | "time-constraint"} ShowAdResultSetting
 */

export class SettingsManager {
	constructor() {
		/**
		 * @typedef SettingConfigBase
		 * @property {string} label
		 * @property {string} description
		 */

		/**
		 * @typedef {SettingConfigBase & {
		 *  type: "number";
		 * 	defaultValue: number;
		 * }} SettingConfigNumber
		 */

		/**
		 * @typedef {SettingConfigBase & {
		 *  type: "boolean";
		 * 	defaultValue: boolean;
		 * }} SettingConfigBoolean
		 */

		/**
		 * @typedef {SettingConfigBase & {
		 *  type: "enum";
		 * 	defaultValue: string;
		 * 	options?: readonly string[];
		 * }} SettingConfigEnum
		 */

		/**
		 * @typedef {SettingConfigNumber | SettingConfigEnum | SettingConfigBoolean} SettingConfig
		 */

		this.settings = /** @type {const} @satisfies {Object.<string, SettingConfig>} */ ({
			"showFullScreenAdResult": {
				label: "showFullScreenAd result",
				description:
					"The result that should be returned by a showFullScreenAd() call.\n'success' will result in the call succeeding without any errors.\nAny of the other options will result in an error of that type.\nAdditionally, 'not-supported' will set `AdLad.canShowFullScreenAd` to `false`, but requires a page reload.",
				type: "enum",
				defaultValue: "success",
				options: ["success", "adblocker", "not-supported", "time-constraint"],
			},
			"showRewardedAdResult": {
				label: "showRewardedAd result",
				description:
					"The result that should be returned by a showRewardedAd() call.\n'success' will result in the call succeeding without any errors.\nAny of the other options will result in an error of that type.\nAdditionally, 'not-supported' will set `AdLad.canShowRewardedAd` to `false`, but requires a page reload.",
				type: "enum",
				defaultValue: "success",
				options: ["success", "user-dismissed", "adblocker", "not-supported", "time-constraint"],
			},
			"fullScreenAdTimeConstraint": {
				label: "showFullScreenAd time constraint",
				description:
					"Time in seconds indicating how frequently fullScreenAds should be shown.\nIf a call to showFullScreenAd() is made before the timer has finished, no ad will be shown.",
				type: "number",
				defaultValue: 5,
			},
			"fullScreenAdTimeConstraintOnPageLoad": {
				label: "showFullScreenAd time constraint on page load",
				description: "When checked, the timer for showFullScreenAd() calls is started when the page loads.",
				type: "boolean",
				defaultValue: false,
			},
			"fullScreenAdPauseDuration": {
				label: "needsPause duration",
				description: "How long needsPause will be true during ads in milliseconds.",
				type: "number",
				defaultValue: 1500,
			},
			"fullScreenAdMuteDuration": {
				label: "needsMute duration",
				description: "How long needsMute will be true during ads in milliseconds.",
				type: "number",
				defaultValue: 500,
			},
		});

		/** @private @type {Map<SettingIds, any>} */
		this.settingValues = new Map();

		this.loadSettings();
	}

	openSettingsWindow() {
		createSettingsWindow(this);
	}

	/**
	 * @template {"enum" | "number" | "boolean"} T
	 * @typedef {T extends "enum" ?
	 * 	string :
	 * T extends "number" ?
	 * 	number :
	 * T extends "boolean" ?
	 * 	boolean :
	 * never} GetSettingType
	 */

	/**
	 * @template {SettingIds} T
	 * @typedef {GetSettingType<this["settings"][T]["type"]>} GetSettingReturn
	 */

	/**
	 * @template {SettingIds} T
	 * @param {T} settingId
	 */
	getSettingValue(settingId) {
		if (!this.settingValues.has(settingId)) {
			const setting = this.settings[settingId];
			return /** @type {GetSettingReturn<T>} */ (setting.defaultValue);
		} else {
			const value = this.settingValues.get(settingId);
			return /** @type {GetSettingReturn<T>} */ (value);
		}
	}

	/**
	 * @template {SettingIds} T
	 * @param {T} settingId
	 * @param {GetSettingReturn<T>} value
	 */
	setValue(settingId, value) {
		this.settingValues.set(settingId, value);
		this.saveSettings();
	}

	/**
	 * @private
	 */
	saveSettings() {
		/** @type {Object.<SettingIds, any>} */
		const settings = {};
		for (const [settingId, value] of this.settingValues) {
			settings[settingId] = value;
		}
		try {
			localStorage.setItem("adLadDummySettings", JSON.stringify(settings));
		} catch {
			// User agent might be in incognito or have cookies disabled
		}
	}

	/**
	 * @private
	 */
	loadSettings() {
		let settings = null;
		try {
			const str = localStorage.getItem("adLadDummySettings");
			if (str) {
				settings = JSON.parse(str);
			}
		} catch {
			// Settings may not have been saved
		}
		if (settings) {
			for (const [settingId, value] of Object.entries(settings)) {
				const castId = /** @type {SettingIds} */ (settingId);
				this.settingValues.set(castId, value);
			}
		}
	}
}
