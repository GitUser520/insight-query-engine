import {ChangeEvent, useState} from "react";

export {SearchRoomByShortName, SearchRoomBySeatsFurnRType};

const SearchRoomByShortName = () => {

	return (
		<form>
			<fieldset>
				<legend>Search Here</legend>
				<label htmlFor={"shortName"}>Short Name</label>
				<br/>
				<input type={"text"} id={"shortName"} name={"shortName"}/>
				<br/>
				<input type={"submit"}/>
			</fieldset>
		</form>
	)
}

const SearchRoomBySeatsFurnRType = () => {
	const [seats, setSeats] = useState(0);
	const [furn, setFurn] = useState("");
	const [rType, setRType] = useState("");

	const handleSeatsChange = (event: ChangeEvent<HTMLInputElement>) => {
		let numSeats = parseInt(event.currentTarget.value);
		if (isNaN(numSeats)) {
			alert("Invalid input for number of seats");
		} else {
			setSeats(numSeats);
		}
	}

	const handleFurnChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFurn(event.currentTarget.value);
	}

	const handleRTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
		setRType(event.currentTarget.value);
	}

	const handleSubmit = () => {
		let queryURL = getURLSeatsFurnRTypeQuery(seats, furn, rType);
		// TODO fetch from server
	}

	return (
		<form onSubmit={handleSubmit}>
			<fieldset>
				<legend>Search Here</legend>
				<label htmlFor={"seats"}>Minimum Number of Seats</label>
				<input type={"text"} id={"seats"} name={"seats"} onChange={handleSeatsChange}/>
				<label htmlFor={"furniture_type"}>Furniture Type</label>
				<input type={"text"} id={"furniture_type"} name={"furniture_type"} onSubmit={handleFurnChange}/>
				<label htmlFor={"room_type"}>Room Type</label>
				<input type={"text"} id={"room_type"} name={"room_type"} onSubmit={handleRTypeChange}/>
				<input type={"submit"}/>
			</fieldset>
		</form>
	)
}

function getURLSeatsFurnRTypeQuery(numSeats: number, furnType: string, roomType: string): string {
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
			COLUMNS: ["rooms_shortName"],
			SORT: {
				ORDER: {
					dir: "up",
					keys: ["rooms_shortName"]
				}
			}
		},
	}
	let validURL = "/" + JSON.stringify(query);
	return validURL;
}

// TODO
function getURLShortNameQuery(shortName: string): string {
	return ""
}

