# Supsis Visitor

This is a React Native component to easily add Supsis Visitor screen to your application.

## Installation

```sh
npm install @supsis/visitor-rn react-native-webview@^13.12.4

or

yarn add @supsis/visitor-rn react-native-webview@^13.12.4
```

## Prerequisites

-   iOS - To enable camera and microphone access in your app, add the following keys to your Info.plist file:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required for live video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is required for live video calls</string>
```

-   Android - Add the following permissions to your AndroidManifest.xml file:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />

```

To use SupsisVisitor in your React application, you will need the Supsis license ID.

-   `domainName` - Defines the name of your application
-   For instance , namespace - `mycompany` - for mycompany.supsis.live
    If you don't have an account, you can create one [here](https://supsis.com/).

## Usage

```tsx
import { RefsInterface, SupsisVisitor } from "@supsis/visitor-rn";

// ...

const supsisRef = useRef < RefsInterface > null;

return (
	<Container>
		<SupsisVisitor ref={supsisRef} domainName={"DOMAIN_NAME"} />
	</Container>
);
```

### Commands for refs

<table>
<tr><td>open</td><td>makes visible supsis</td></tr>
<tr><td>close</td><td>makes invisible supsis</td></tr>
<tr><td>setUserData</td><td>fills login form</td></tr>
<tr><td>setDepartment</td><td>allows you to pick a department</td></tr>
<tr><td>setContactProperty</td><td>fills contact properties</td></tr>
<tr><td>clearCache</td><td>clear visitor data</td></tr>
</table>

Example:

```ts
supsisRef.current?.setUserData({
	email: "John@doe.com",
});
```

### Visitor Connected & Destroyed Chat

```tsx
import { RefsInterface, SupsisVisitor } from "@supsis/visitor-rn";

const supsisRef = useRef < RefsInterface > null;

const onDisconnected: void = () => {
	console.log("Visitor Disconnected from Chat!");
};

const onConnected: void = () => {
	console.log("Visitor Disconnected from Chat!");
};

return (
	<Container>
		<SupsisVisitor
			ref={supsisRef}
			domainName={"DOMAIN_NAME"}
			onDisconnected={onDisconnected}
			onConnected={onConnected}
		/>
	</Container>
);
```

## Support

If you need any help, you can chat with us [here](https://supsis.com/).

I hope you will find this module useful. Happy coding!

## License

[MIT](./LICENSE)
