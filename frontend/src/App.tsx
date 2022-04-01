import React, {useState, useEffect} from 'react';
import './App.css';
import {Welcome} from "./components/HomePage";
import {SearchRoomBySeatsFurnRType, SearchRoomByShortName} from "./components/SearchBox"

function App(): JSX.Element {
	const [welcome, setWelcome] = useState<boolean>(true);
	const [displayData, setDisplayData] = useState({});

	const callbackData = (jsonObject: object) => {
		setDisplayData(jsonObject);
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
				<SearchRoomByShortName callback = {callbackData}/>
			</div>
			<div className={"SearchRoomBySeatsFurnRType"}>
				<SearchRoomBySeatsFurnRType callback = {callbackData}/>
			</div>
			<div className={"DisplayData"}>
				<p>{/* TODO display data*/ ""}</p>
			</div>
		</div>
	);
}

export default App;



