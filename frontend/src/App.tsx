import React, {useState, useEffect} from 'react';
import './App.css';
import {Welcome} from "./components/HomePage";
import {
	SearchRoomBySeatsFurnRType, SearchRoomByShortName, SHORTNAME, SEATSFURNRTYPE
} from "./components/SearchBox"

function App(): JSX.Element {
	const [welcome, setWelcome] = useState<boolean>(true);
	const [displayData, setDisplayData] = useState<object>({});
	const [displayState, setDisplayState] = useState<string>("value");

	const callbackData = (jsonObject: object, displayState: string): void => {
		setDisplayData(jsonObject);
		setDisplayState(displayState);
	};

	useEffect(() => {
		// alert("Changed");
	}, [displayState]);

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
				{htmlToDisplay(displayData, displayState)}
			</div>
		</div>
	);
}

function htmlToDisplay(json: object, displayState: string): JSX.Element {
	if ((json as any).error !== undefined) {
		alert("Could not find a valid entry");
	}
	let jsonString = JSON.stringify(json);
	if (displayState === SHORTNAME) {
		return (
			<p>{jsonString}</p>
		);
	} else if (displayState === SEATSFURNRTYPE) {
		return (
			<p>{jsonString}</p>
		);
	}
	return (
		<p></p>
	);
}

export default App;



