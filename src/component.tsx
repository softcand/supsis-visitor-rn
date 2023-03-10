import React, { forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef, useState } from "react";
import { SafeAreaView } from "react-native";
import WebView from "react-native-webview";
import { styles } from "./supsis-styles";
import { PropsInterface } from "./props-interface";
import { ObjectLike } from "./types";
import { RefsInterface } from "./refs-interface";
import { convertToString } from "./utils";

const SupsisVisitor: ForwardRefRenderFunction<RefsInterface, PropsInterface> = ({ domainName }, ref) => {
	const webViewRef = useRef<WebView>(null);
	const uri = `https://${domainName}.visitor.supsis.live`;
	const [visible, setVisible] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [buff, setBuff] = useState<Function[]>([]);

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

	const setUserData = (payload: ObjectLike) => {
		const fn = () => inject("set-user-data", convertToString(payload));
		if (loaded) fn();
		else add2Buff(fn);
	};

	const setDepartment = (payload: string) => {
		const fn = () => inject("set-department", `"${payload}"`);
		if (loaded) fn();
		else add2Buff(fn);
	};

	const autoLogin = (payload: ObjectLike) => {
		const body = { initialMessage: "", loginData: JSON.stringify(payload) };
		const fn = () => inject("auto-login", convertToString(body));
		if (loaded) fn();
		else add2Buff(fn);
	};

	useImperativeHandle(ref, () => ({
		setUserData,
		setDepartment,
		autoLogin,
		open: () => setVisible(true),
		close: () => setVisible(false),
	}));

	const onLoadEnd = () => {
		setTimeout(() => setLoaded(true), 1000);
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
			/>
		</SafeAreaView>
	);
};

export default forwardRef(SupsisVisitor);
