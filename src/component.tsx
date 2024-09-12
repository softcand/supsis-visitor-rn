import React, { forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef, useState } from "react";
import { SafeAreaView } from "react-native";
import WebView from "react-native-webview";
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

const _noop = () => {
};
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
				});`;
		webViewRef.current?.injectJavaScript(script);
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
		setTimeout(() => setLoaded(true), 1000);
	};

	const listenPostMessage = (e: any) => {
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
		} catch {}
	};

	useEffect(() => {
		if (loaded && buff.length > 0) {
			buff.map((b) => b());
			setBuff([]);
		}
	}, [loaded]);

	return (
		<SafeAreaView style={[styles.container, { display: visible ? "flex" : "none" }]}>
			<WebView
				ref={webViewRef}
				source={{ uri }}
				onLoadEnd={onLoadEnd}
				cacheEnabled
				javaScriptEnabled
				allowsInlineMediaPlayback
				allowsAirPlayForMediaPlayback
				allowsFullscreenVideo
				allowFileAccess
				onMessage={listenPostMessage}
			/>
		</SafeAreaView>
	);
};

export default forwardRef(SupsisVisitor);
