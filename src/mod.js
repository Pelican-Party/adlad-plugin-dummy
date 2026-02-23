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

	function bannerAdClickHandler() {
		settingsManager.openSettingsWindow();
	}

	let lastShowAdTime = -Infinity;
	if (settingsManager.getSettingValue("fullScreenAdTimeConstraintOnPageLoad")) {
		lastShowAdTime = performance.now();
	}

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

	if (settingsManager.getSettingValue("bannerAdsSupported")) {
		castPlugin.showBannerAd = ({ el, id, width, height }) => {
			const maskId = id + "-ad-placeholder-mask";
			el.innerHTML = `
				<style>
					.adlad-banner-placeholder:hover {
						cursor: pointer;
						filter: brightness(80%);
					}
				</style>
				<svg class="adlad-banner-placeholder" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
					<mask id="${maskId}">
						<rect width="${width}" height="${height}" fill="black"/>
						<g fill="transparent" stroke="white" stroke-width="2">
							<rect x="1" y="1" width="${width - 2}" height="${height - 2}"/>
								<line x1="0" y1="0" x2="${width}" y2="${height}"/>
								<line x1="${width}" y1="0" x2="0" y2="${height}"/>
							</g>
						<rect class="text-rect" fill="black"/>
						<text class="text" x="${width / 2}" y="${
				height / 2
			}" text-anchor="middle" dominant-baseline="central" fill="white" style="font: bold 15px sans-serif;">AD</text>
					</mask>
					<rect width="${width}" height="${height}" fill="#ffffff17"/>
					<rect width="${width}" height="${height}" fill="black" mask="url(#${maskId})"/>
				</svg>
			`;
			const text = /** @type {SVGTextElement} */ (el.querySelector(".text"));
			const rect = /** @type {SVGRectElement} */ (el.querySelector(".text-rect"));
			const bbox = text.getBBox();
			rect.setAttribute("x", String(bbox.x));
			rect.setAttribute("y", String(bbox.y));
			rect.setAttribute("width", String(bbox.width));
			rect.setAttribute("height", String(bbox.height));

			el.addEventListener("click", bannerAdClickHandler);
		};

		castPlugin.destroyBannerAd = ({ el }) => {
			el.innerHTML = "";
			el.removeEventListener("click", bannerAdClickHandler);
		};
	}

	return plugin;
}

export default dummyPlugin;
