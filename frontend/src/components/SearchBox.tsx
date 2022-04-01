import {ChangeEvent, FormEvent, useState} from "react";

export {SearchRoomByShortName, SearchRoomBySeatsFurnRType};

export const SERVER_URL = "http://localhost:4321";
export const SHORTNAME = "shortName";
export const SEATSFURNRTYPE = "seatsFurnRType";
const QUERY_URL = SERVER_URL + "/query";

interface callbackFunction {
	callback: (json: object, displayState: string) => void;
}

function SearchRoomByShortName(callback: callbackFunction) {
	const [shortName, setShortName] = useState("");
	const handleShortNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setShortName(event.currentTarget.value);
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		let queryJSON = getURLShortNameQuery(shortName);
		let httpMetadata = {
			method: "POST",
			headers: {
				'Content-Type': "application/json"
			},
			body: JSON.stringify(queryJSON)
		}
		fetch(QUERY_URL, httpMetadata)
			.then((response) =>
				response.json()
			)
			.then((queryData) => {
				callback.callback(queryData, SHORTNAME);
				console.log(queryData);
			})
			.catch((error) => {
				alert("Error: " + error);
			});
	}

	return (
		<form onSubmit={handleSubmit}>
			<fieldset>
				<legend>Search Here</legend>
				<label htmlFor={"shortName"}>Short Name</label>
				<br/>
				<input type={"text"} id={"shortName"} name={"shortName"} onChange={handleShortNameChange}/>
				<br/>
				<input type={"submit"}/>
			</fieldset>
		</form>
	)
}

function SearchRoomBySeatsFurnRType(callback: callbackFunction) {
	const [seats, setSeats] = useState(0);
	const [furn, setFurn] = useState("");
	const [rType, setRType] = useState("");

	const handleSeatsChange = (event: ChangeEvent<HTMLInputElement>): void => {
		let numSeats = parseInt(event.currentTarget.value);
		if (isNaN(numSeats)) {
			console.log("Invalid input for number of seats");
		} else {
			setSeats(numSeats);
		}
	}

	const handleFurnChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setFurn(event.currentTarget.value);
	}

	const handleRTypeChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setRType(event.currentTarget.value);
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		let queryJSON = getURLSeatsFurnRTypeQuery(seats, furn, rType);
		let httpMetadata = {
			method: "POST",
			headers: {
				'Content-Type': "application/json"
			},
			body: JSON.stringify(queryJSON)
		}
		fetch(QUERY_URL, httpMetadata)
			.then((response) =>
				response.json()
			)
			.then((queryData) => {
				callback.callback(queryData, SHORTNAME);
				console.log(queryData);
			})
			.catch((error) => {
				alert("Error: " + error);
			});
	}

	return (
		<form onSubmit={handleSubmit}>
			<fieldset>
				<legend>Search Here</legend>
				<label htmlFor={"seats"}>Minimum Number of Seats</label>
				<input type={"text"} id={"seats"} name={"seats"} onChange={handleSeatsChange}/>
				<label htmlFor={"furniture_type"}>Furniture Type</label>
				<input type={"text"} id={"furniture_type"} name={"furniture_type"} onChange={handleFurnChange}/>
				<label htmlFor={"room_type"}>Room Type</label>
				<input type={"text"} id={"room_type"} name={"room_type"} onChange={handleRTypeChange}/>
				<input type={"submit"}/>
			</fieldset>
		</form>
	)
}

function getURLSeatsFurnRTypeQuery(numSeats: number, furnType: string, roomType: string): object {
	let query = {
		WHERE: {
			AND: [
				{
					GT: {
						"rooms_seats": numSeats
					}
				},
				{
					IS: {
						"rooms_furniture": furnType
					}
				},
				{
					IS: {
						"rooms_type": roomType
					}
				},
			]
		},
		OPTIONS: {
			COLUMNS: [
				"rooms_shortname"
			],
			ORDER: "rooms_shortname"
		},
	};
	return query;
}

function getURLShortNameQuery(shortName: string): object {
	let query = {
		WHERE: {
			IS: {
				"rooms_shortname": shortName
			}
		},
		OPTIONS: {
			COLUMNS: ["rooms_lat", "rooms_lon"]
		}
	};
	return query;
}

