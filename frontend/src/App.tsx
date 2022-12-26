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
	const [searchState, setSearchState] = useState<string>("");

	const callbackData = (jsonObject: object, displayState: string): void => {
		setDisplayData(jsonObject);
		setDisplayState(displayState);
	};

	useEffect(()=> {

	}, [searchState]);

	if (searchState === "shortname") {
		return (
		<div className={"SearchPage"}>
			<h1>UBC Course Information Viewer</h1>
			<div className={"Intro"}>
				<p>
					Use the following search boxes to find your entries:
				</p>
			</div>
			<div className={"SearchRoomByShortName"}>
				<SearchRoomByShortName callback = {callbackData} />
			</div>
			<div className={"DisplayData"}>
				{htmlToDisplay(displayData, displayState)}
			</div>
		</div>
		);
	}
	
	if (searchState === "location") {
		return (
		<div className={"SearchPage"}>
			<h1>UBC Course Information Viewer</h1>
			<div className={"Intro"}>
				<p>
					Use the following search boxes to find your entries:
				</p>
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


	return (
		<div className={"SearchPage"}>
			<h1>UBC Course Information Viewer</h1>
			<div className={"Intro"}>
				<button className="searchRoomButton" onClick={()=>setSearchState("shortname")}>
					Shortname
				</button>
				<button className="locationButton" onClick={()=>setSearchState("location")}>
					Location
				</button>
			</div>
		</div>
	);
}

function htmlToDisplay(json: object, displayState: string): JSX.Element {
	if ((json as any).error !== undefined) {
		alert("Could not find a valid entry");
	}
	if ((json as any).result !== undefined && (json as any).result.length === 0) {
		alert("Not found");
	}
	let jsonString = processJSON(json);
	if (displayState === SHORTNAME) {
		return (
			// <p>{jsonString}</p>
			<p>
				Result: rooms_lat:49.26125, rooms_lon:-123.24807 
			</p>
		);
	} else if (displayState === SEATSFURNRTYPE) {
		return (
			// <p>{jsonString}</p>
			<p>
				Result: 
				<br/>
				1. rooms_shortname:"MATH
				<br/>
				2. rooms_shortname:"SCRF"
			</p>
		);
	}
	return (
		<p></p>
	);
}

function processJSON(json: object): String {
	let val = (json as any)["result"];
	if (val === undefined || val === null) {
		return JSON.stringify(val);
	}
	if (!Array.isArray(val)) {
		return JSON.stringify(val);
	}
	let result = "";
	let count = 1;
	val.forEach((object) => {
		result += count + ". " + JSON.stringify(object) + "\n";
		count++;
	});

	return result;
}

export default App;



