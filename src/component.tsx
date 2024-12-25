import React, { forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef, useState } from "react";
import { SafeAreaView, Platform, PermissionsAndroid, KeyboardAvoidingView } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { styles } from "./supsis-styles";
import { PropsInterface } from "./props-interface";
import { ObjectLike } from "./types";
import { RefsInterface } from "./refs-interface";

const getDomain = (domainName: string | undefined, environment: string | undefined): string => {
	let uri = "";
	if (environment === "beta") {
		uri = domainName ? `https://${domainName}.betavisitor.supsis.live/` : "https://betavisitor.supsis.live/";
	} else if (environment === "prod") {
		uri = domainName ? `https://${domainName}.visitor.supsis.live/` : "https://visitor.supsis.live/";
	}
	return uri;
};

const _noop = () => {};

const SupsisVisitor: ForwardRefRenderFunction<RefsInterface, PropsInterface> = (
	{ domainName, environment = "prod", onConnected, onDisconnected },
	ref,
) => {
	const webViewRef = useRef<WebView>(null);
	const uri = getDomain(domainName, environment);
	const [visible, setVisible] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [buff, setBuff] = useState<Function[]>([]);
	const [connected, setConnected] = useState(false);

	const inject = (cmd: string, payload: ObjectLike | string): void => {
		const script = `
		window.postMessage({
		  command: "${cmd}",
		  payload: ${payload},
		});
	  `;
		webViewRef.current?.injectJavaScript(script);
	};

	type PermissionRequest = {
		resources: string[];
		grant: (resources: string[]) => void;
		deny: () => void;
	};

	const add2Buff = (fn: Function): void => {
		setBuff((prevState) => [...prevState, fn]);
	};

	const setContactProperty = (payload: ObjectLike) => {
		const fn = () => inject("set-contact-property", JSON.stringify(payload));
		if (loaded) {
			fn();
		} else {
			add2Buff(fn);
		}
	};

	const setUserData = (payload: ObjectLike) => {
		const fn = () => inject("set-user-data", JSON.stringify(payload));
		if (loaded) {
			fn();
		} else {
			add2Buff(fn);
		}
	};

	const setDepartment = (payload: string) => {
		const fn = () => inject("set-department", `"${payload}"`);
		if (loaded) {
			fn();
		} else {
			add2Buff(fn);
		}
	};

	const autoLogin = (payload: ObjectLike) => {
		const body = { initialMessage: "", loginData: payload };
		const fn = () => inject("auto-login", JSON.stringify(body));
		if (loaded) {
			fn();
		} else {
			add2Buff(fn);
		}
	};

	const clearCache = () => {
		const fn = () => inject("auto-login", JSON.stringify("{}"));
		if (loaded) {
			fn();
		} else {
			add2Buff(fn);
		}
	};

	useImperativeHandle(ref, () => ({
		setContactProperty,
		setUserData,
		setDepartment,
		autoLogin,
		clearCache,
		open: () => setVisible(true),
		close: () => setVisible(false),
	}));

	const onLoadEnd = () => {
		setLoaded(true);
	};

	const requestPermissions = async () => {
		if (Platform.OS === "android") {
			try {
				const granted = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
					PermissionsAndroid.PERMISSIONS.CAMERA,
				]);
				if (
					granted["android.permission.RECORD_AUDIO"] !== PermissionsAndroid.RESULTS.GRANTED ||
					granted["android.permission.CAMERA"] !== PermissionsAndroid.RESULTS.GRANTED
				) {
					console.warn("Kamera ve mikrofon izinleri verilmedi.");
				}
			} catch (err) {
				console.warn(err);
			}
		}
	};

	const listenPostMessage = (e: WebViewMessageEvent) => {
		const { nativeEvent } = e || {};
		try {
			const data = JSON.parse(nativeEvent?.data);
			if (data?.command === "minimize") {
				setVisible(false);
			} else if (data?.command === "visitor-connected") {
				if (!connected) {
					if (!onConnected) {
						onConnected = _noop;
					}
					onConnected();
				}
				setConnected(true);
			} else if (data?.command === "visitor-disconnected") {
				if (!onDisconnected) {
					onDisconnected = _noop;
				}
				if (connected) {
					onDisconnected();
				}
				setConnected(false);
			}
		} catch (error) {
			console.warn("Mesaj işlenirken hata oluştu:", error);
		}
	};

	useEffect(() => {
		if (loaded && buff.length > 0) {
			buff.forEach((b) => b());
			setBuff([]);
		}
	}, [loaded]);

	useEffect(() => {
		requestPermissions();
	}, []);

	return (
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<SafeAreaView style={[styles.container, { display: visible ? "flex" : "none" }]}>
				<WebView
					ref={webViewRef}
					source={{ uri }}
					onLoadEnd={onLoadEnd}
					cacheEnabled
					javaScriptEnabled
					domStorageEnabled
					allowsInlineMediaPlayback
					allowsAirPlayForMediaPlayback
					allowsFullscreenVideo
					mediaPlaybackRequiresUserAction={false}
					allowFileAccess
					onMessage={listenPostMessage}
					mediaCapturePermissionGrantType="grant"
					{...(Platform.OS === "android" && {
						onPermissionRequest: (request: PermissionRequest) => {
							try {
								request.grant(request.resources);
							} catch (error) {
								console.warn("İzin isteği işlenirken hata oluştu:", error);
							}
						},
					})}
				/>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
};

export default forwardRef(SupsisVisitor);
