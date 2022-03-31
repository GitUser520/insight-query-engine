import React, {useState, useEffect} from 'react';
import './App.css';
import {Welcome} from "./components/HomePage";
import {SearchRoomBySeatsFurnRType, SearchRoomByShortName} from "./components/SearchBox"

function App(): JSX.Element {
	const [welcome, setWelcome] = useState<boolean>(true);

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
				<SearchRoomByShortName/>
			</div>
			<div className={"SearchRoomBySeatsFurnRType"}>
				<SearchRoomBySeatsFurnRType/>
			</div>
		</div>
	);
}

export default App;



