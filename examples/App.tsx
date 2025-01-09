import { FC, useEffect, useRef } from "react";
import { View } from "react-native";
import { RefsInterface, SupsisVisitor } from "@supsis/visitor-rn";

export const App: FC = () => {
	const supsisRef = useRef<RefsInterface>(null);

	useEffect(() => {
		supsisRef.current?.open();
		supsisRef.current?.setUserData({
			fullname: "Samed Doe",
			email: "samed@doe.com",
			department: "SUPSIS AI MOBILE",
		});
	}, [supsisRef]);

	const handleMinimize = () => {
		// burada widget kapatılabilir veya istenen aksiyon alınabilir.
		console.log("Chat widget minimized");
	};

	return (
		<View style={{ flex: 1 }}>
			<SupsisVisitor ref={supsisRef} domainName="geovision" onMinimize={handleMinimize} />
		</View>
	);
};

export default App;
