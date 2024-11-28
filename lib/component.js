var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { SafeAreaView, Platform, PermissionsAndroid } from "react-native";
import WebView from "react-native-webview";
import { styles } from "./supsis-styles";
const getDomain = (domainName, environment) => {
    let uri = "";
    if (environment === "beta") {
        uri = domainName ? `https://${domainName}.betavisitor.supsis.live/` : "https://betavisitor.supsis.live/";
    }
    else if (environment === "prod") {
        uri = domainName ? `https://${domainName}.visitor.supsis.live/` : "https://visitor.supsis.live/";
    }
    return uri;
};
const _noop = () => { };
const SupsisVisitor = ({ domainName, environment = "prod", onConnected, onDisconnected }, ref) => {
    const webViewRef = useRef(null);
    const uri = getDomain(domainName, environment);
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [buff, setBuff] = useState([]);
    const [connected, setConnected] = useState(false);
    const inject = (cmd, payload) => {
        var _a;
        const script = `
		window.postMessage({
		  command: "${cmd}",
		  payload: ${payload},
		});
	  `;
        (_a = webViewRef.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(script);
    };
    const add2Buff = (fn) => {
        setBuff((prevState) => [...prevState, fn]);
    };
    const setContactProperty = (payload) => {
        const fn = () => inject("set-contact-property", JSON.stringify(payload));
        if (loaded) {
            fn();
        }
        else {
            add2Buff(fn);
        }
    };
    const setUserData = (payload) => {
        const fn = () => inject("set-user-data", JSON.stringify(payload));
        if (loaded) {
            fn();
        }
        else {
            add2Buff(fn);
        }
    };
    const setDepartment = (payload) => {
        const fn = () => inject("set-department", `"${payload}"`);
        if (loaded) {
            fn();
        }
        else {
            add2Buff(fn);
        }
    };
    const autoLogin = (payload) => {
        const body = { initialMessage: "", loginData: payload };
        const fn = () => inject("auto-login", JSON.stringify(body));
        if (loaded) {
            fn();
        }
        else {
            add2Buff(fn);
        }
    };
    const clearCache = () => {
        const fn = () => inject("auto-login", JSON.stringify("{}"));
        if (loaded) {
            fn();
        }
        else {
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
    const requestPermissions = () => __awaiter(void 0, void 0, void 0, function* () {
        if (Platform.OS === "android") {
            try {
                const granted = yield PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                ]);
                if (granted["android.permission.RECORD_AUDIO"] !== PermissionsAndroid.RESULTS.GRANTED ||
                    granted["android.permission.CAMERA"] !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.warn("Kamera ve mikrofon izinleri verilmedi.");
                }
            }
            catch (err) {
                console.warn(err);
            }
        }
    });
    const listenPostMessage = (e) => {
        const { nativeEvent } = e || {};
        try {
            const data = JSON.parse(nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.data);
            if ((data === null || data === void 0 ? void 0 : data.command) === "minimize") {
                setVisible(false);
            }
            else if ((data === null || data === void 0 ? void 0 : data.command) === "visitor-connected") {
                if (!connected) {
                    if (!onConnected) {
                        onConnected = _noop;
                    }
                    onConnected();
                }
                setConnected(true);
            }
            else if ((data === null || data === void 0 ? void 0 : data.command) === "visitor-disconnected") {
                if (!onDisconnected) {
                    onDisconnected = _noop;
                }
                if (connected) {
                    onDisconnected();
                }
                setConnected(false);
            }
        }
        catch (error) {
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
    return (<SafeAreaView style={[styles.container, { display: visible ? "flex" : "none" }]}>
			<WebView ref={webViewRef} source={{ uri }} onLoadEnd={onLoadEnd} cacheEnabled javaScriptEnabled domStorageEnabled allowsInlineMediaPlayback allowsAirPlayForMediaPlayback allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} allowFileAccess onMessage={listenPostMessage} mediaCapturePermissionGrantType="grant" {...(Platform.OS === "android" && {
        onPermissionRequest: (request) => {
            try {
                request.grant(request.resources);
            }
            catch (error) {
                console.warn("İzin isteği işlenirken hata oluştu:", error);
            }
        },
    })}/>
		</SafeAreaView>);
};
export default forwardRef(SupsisVisitor);
