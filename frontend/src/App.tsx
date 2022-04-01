import React, {useState, useEffect} from 'react';
import './App.css';
import {Welcome} from "./components/HomePage";
import {SearchRoomBySeatsFurnRType, SearchRoomByShortName} from "./components/SearchBox"

function App(): JSX.Element {
	const [welcome, setWelcome] = useState<boolean>(true);
	const [displayData, setDisplayData] = useState<object>({});
	const [displayState, setDisplayState] = useState<string>("");

	const callbackData = (jsonObject: object, displayState: string): void => {
		setDisplayData(jsonObject);
		setDisplayState(displayState);
	};

	useEffect(() => {
		setTimeout(setWelcome, 2000, false);
	}, );

	if (welcome) {
		return (
			<div className={"WelcomePage"}>
				<Welcome/>
			</div>
		);
	}

	return (
		<div className={"SearchPage"}>
			<div className={"Intro"}>
				<p>
					Use the following search boxes to find your entries:
				</p>
			</div>
			<div className={"SearchRoomByShortName"}>
				<SearchRoomByShortName callback = {callbackData} />
			</div>
			<div className={"SearchRoomBySeatsFurnRType"}>
				<SearchRoomBySeatsFurnRType callback = {callbackData}/>
			</div>
			<div className={"DisplayData"}>
				<p>{htmlToDisplay(displayData)}</p>
			</div>
		</div>
	);
}

function htmlToDisplay(json: object): string {
	let jsonString = JSON.stringify(json);
	if (jsonString === "{}") {
		return "";
	}
	return "";
}

export default App;



