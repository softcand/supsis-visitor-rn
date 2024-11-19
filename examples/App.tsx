import { FC, useEffect, useRef } from "react";
import { View } from "react-native";
import { RefsInterface, SupsisVisitor } from "@supsis/visitor-rn";

export const App: FC = () => {
	const supsisRef = useRef<RefsInterface>(null);

	useEffect(() => {
		supsisRef.current?.open();
		supsisRef.current?.setUserData({ fullname: "John Doe", email: "john@doe.com" });
	}, [supsisRef.current]);

	return (
		<View style={{ flex: 1 }}>
			<SupsisVisitor ref={supsisRef} domainName={"geovision"} />
		</View>
	);
};

export default App;
