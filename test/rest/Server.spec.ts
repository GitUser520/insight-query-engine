import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use, request} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs-extra";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";
import {clearDisk} from "../TestUtil";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;
	use(chaiHttp);
	const persistDir = "./data";
	const datasetsToLoad: {[key: string]: any} = {
		courses: "./test/resources/archives/courses.zip",
		rooms: "./test/resources/archives/rooms.zip",
	};
	const coursesBuffer = fs.readFileSync(datasetsToLoad["courses"]);
	const roomsBuffer = fs.readFileSync(datasetsToLoad["rooms"]);

	let SERVER_URL = "http://localhost:4321";
	const ENDPOINT_PUT_COURSE = "/dataset/courses/courses";
	const ENDPOINT_DELETE_COURSE = "/dataset/courses";
	const ENDPOINT_PUT_ROOM = "/dataset/rooms/rooms";
	const ENDPOINT_DELETE_ROOM = "/dataset/rooms";
	const ENDPOINT_GET = "/datasets";
	const ENDPOINT_POST = "/query";

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);

		server.start().then(() => {
			console.log("server started");
		}).catch((err) => {
			console.log(err);
		});
	});

	after(function () {
		// TODO: stop server here once!
		server.stop().then(() => {
			console.log("server stopped");
		}).catch((err) => {
			console.log(err);
		});
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		clearDisk();

	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		fs.removeSync(persistDir);
	});

	// Sample on how to format PUT requests
	it("PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_PUT_COURSE)
				.send(coursesBuffer)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					// console.log(res.body);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			// console.log(err);
		}
	});

	it("PUT test for rooms dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_PUT_ROOM)
				.send(roomsBuffer)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					// console.log(res.body);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			// console.log(err);
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
	it("GET test for one courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_PUT_COURSE)
				.send(coursesBuffer)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					// console.log(res.body);
					expect(res.body).to.deep.equal({result: ["courses"]});
					expect(res.status).to.be.equal(200);
					return request(SERVER_URL).get(ENDPOINT_GET)
						.then(function (get_res: ChaiHttp.Response) {
							// some logging here please!
							// console.log(get_res.body);
							expect(get_res.body).to.deep.equal({
								result: [{id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612}]});
							expect(get_res.status).to.be.equal(200);
						})
						.catch(function (err) {
							// some logging here please!
							// console.log(err);
							expect.fail();
						});
				});
		} catch (err) {
			// and some more logging here!
			// console.log(err);
		}
	});

	it("DELETE test for one courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_PUT_COURSE)
				.send(coursesBuffer)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					// console.log(res.body);
					expect(res.status).to.be.equal(200);
					return request(SERVER_URL).delete(ENDPOINT_DELETE_COURSE)
						.then(function (delete_res: ChaiHttp.Response) {
							// some logging here please!
							// console.log(delete_res.body);
							expect(delete_res.body).to.deep.equal({result: "courses"});
							expect(delete_res.status).to.be.equal(200);
							return request(SERVER_URL).get(ENDPOINT_GET)
								.then(function (get_res: ChaiHttp.Response) {
									// console.log(get_res.body);
									expect(get_res.body).to.deep.equal({result: []});
									expect(get_res.status).to.be.equal(200);
								});
						});
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			// console.log(err);
		}
	});

	it("DELETE test for dataset not found", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_PUT_ROOM)
				.send(roomsBuffer)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					// console.log(res.body);
					expect(res.status).to.be.equal(200);
					return request(SERVER_URL).delete(ENDPOINT_DELETE_COURSE)
						.then(function (delete_res: ChaiHttp.Response) {
							// some logging here please!
							// console.log(delete_res.body);
							expect(delete_res.status).to.be.equal(404);
							return request(SERVER_URL).get(ENDPOINT_GET)
								.then(function (get_res: ChaiHttp.Response) {
									// console.log(get_res.body);
									expect(get_res.body).to.deep.equal({
										result: [{id: "rooms", kind: InsightDatasetKind.Rooms, numRows: 364}]});
									expect(get_res.status).to.be.equal(200);
								});
						});
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			// console.log(err);
		}
	});

});
