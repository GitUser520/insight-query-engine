import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtil";

import * as fs from "fs-extra";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect} from "chai";
import InsightFacade from "../../src/controller/InsightFacade";


describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDir = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		courses: "./test/resources/archives/courses.zip",
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			clearDisk();
			insightFacade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		// This is a unit test. You should create more like this!
		it("Should add a valid dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		it("should not add one dataset given invalid file type", async function () {
			const contentInvalid = getContentFromArchives("invalid.txt");
			try {
				await insightFacade.addDataset("courses", contentInvalid, InsightDatasetKind.Courses);
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should not add one dataset given no valid section", async function () {
			const contentInvalid = getContentFromArchives("coursesWrongFieldType.zip");
			try {
				await insightFacade.addDataset("courses2", contentInvalid, InsightDatasetKind.Courses);
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should not add one dataset given invalid dataset", async function () {
			const contentInvalid = getContentFromArchives("invalid.txt");
			try {
				await insightFacade.addDataset("courses", contentInvalid, InsightDatasetKind.Courses);
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should not add one dataset given invalid id with underscore", async function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				await insightFacade.addDataset("courses_2", content, InsightDatasetKind.Courses);
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should not add one dataset given invalid id empty string", async function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				await insightFacade.addDataset("", content, InsightDatasetKind.Courses);
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should not add one dataset given a valid dataset that was already added", async function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				await insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
			} catch (err) {
				expect.fail("cannot add dataset");
			}
			try {
				await insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should list no dataset", function () {
			return insightFacade.listDatasets().then((insightDatasets: any ) => {
				expect(insightDatasets).to.deep.equal([]);
				// or:
				expect(insightDatasets).to.be.an.instanceof(Array);
				expect(insightDatasets).to.have.length(0);
			});
		});

		it("should list one dataset", function () {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => insightFacade.listDatasets())
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					}]);

					// or:
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(1);
					const [insightDataset] = insightDatasets;
					expect(insightDataset).to.have.property("id");
					expect(insightDataset.id).to.equal("courses");
					expect(insightDataset).to.have.property("kind");
					expect(insightDataset.kind).to.equal(InsightDatasetKind.Courses);
					expect(insightDataset).to.have.property("numRows");
					expect(insightDataset.numRows).to.equal(64612);


				});

		});

		it("should list multiple datasets", function () {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.addDataset("courses-2", content, InsightDatasetKind.Courses);
				})
				.then(() => {
					return insightFacade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});

		});

		it("should remove one dataset given valid id", async function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				await insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
			} catch (err) {
				expect.fail("cannot add dataset");
			}
			return insightFacade.removeDataset("courses").then((removed: any ) => {
				expect(removed).to.equal("courses");
			});
		});

		it("should not remove one dataset given valid id not yet added", async function () {
			const content: string = datasetContents.get("courses") ?? "";

			try {
				await insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
			} catch (err) {
				expect.fail("cannot add dataset");
			}
			try {
				await insightFacade.removeDataset("cou");
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(NotFoundError);
			}
		});

		it("should not remove one dataset given invalid id", async function () {
			const content: string = datasetContents.get("courses") ?? "";
			try {
				await insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
			} catch (err) {
				expect.fail("cannot add dataset");
			}
			try {
				await insightFacade.removeDataset("courses_1");
				expect.fail("should have thrown an error");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		let courseContent: string = getContentFromArchives("courses.zip");
/*	let facade: InsightFacade;
	let courseContent: string = getContentFromArchives("courses.zip");

	describe("addDataset", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});*/
		it("add one dataset no repeat", function () {
			return insightFacade
				.addDataset("courses", courseContent, InsightDatasetKind.Courses)
				.then((results: string[]) => {
					expect(results).to.deep.equal(["courses"]);

					return insightFacade.listDatasets();
				})
				.then((insightDatasetArray: InsightDataset[]) => {
					expect(insightDatasetArray).to.be.an.instanceOf(Array);
					expect(insightDatasetArray).to.deep.equal([
						{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
					]);
				});
		});

		it("add one dataset with repeat", function () {
			return insightFacade
				.addDataset("courses", courseContent, InsightDatasetKind.Courses)
				.then((results: string[]) => {
					expect(results).to.deep.equal(["courses"]);

					return insightFacade.addDataset("courses", courseContent, InsightDatasetKind.Courses);
				})
				.catch(async (error: InsightError) => {
					const results = await insightFacade.listDatasets();
					expect(results).to.deep.members([
						{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
					]);

					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("add multiple datasets no repeat", function () {
			return insightFacade
				.addDataset("courses", courseContent, InsightDatasetKind.Courses)
				.then((results: string[]) => {
					expect(results).to.deep.members(["courses"]);

					return insightFacade.addDataset("courses-2", courseContent, InsightDatasetKind.Courses);
				})
				.then((results: string[]) => {
					expect(results).to.deep.members(["courses", "courses-2"]);

					return insightFacade.listDatasets();
				})
				.then((insightDatasetArray: InsightDataset[]) => {
					expect(insightDatasetArray).to.be.an.instanceOf(Array);
					expect(insightDatasetArray).to.have.length(2);
					expect(insightDatasetArray).to.have.deep.members([
						{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
						{
							id: "courses-2",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
					]);
				});
		});

		it("add one dataset with invalid id containing underscore", function () {

			return insightFacade.addDataset("courses_now", courseContent, InsightDatasetKind.Courses)
				.catch(async (error: Error) => {
					const results = await insightFacade.listDatasets();
					expect(results).to.have.length(0);

					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("add one dataset with invalid id containing only whitespaces", function () {

			return insightFacade.addDataset("   ", courseContent, InsightDatasetKind.Courses)
				.catch(async (error: Error) => {
					const results = await insightFacade.listDatasets();
					expect(results).to.have.deep.members([]);

					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("add one valid dataset with empty string id", function () {

			return insightFacade.addDataset("", courseContent, InsightDatasetKind.Courses)
				.catch(async (error: Error) => {
					const results = await insightFacade.listDatasets();
					expect(results).to.have.deep.members([]);

					expect(error).to.be.instanceOf(InsightError);
				});
				// .then(async (results: string[]) => {
				// 	expect(results).to.deep.members([""]);
				//
				// 	const insightResult = await insightFacade.listDatasets();
				// 	expect(insightResult).to.have.equal([
				// 		{
				// 			id: "",
				// 			kind: InsightDatasetKind.Courses,
				// 			numRows: 64612,
				// 		},
				// 	]);
				// });
		});

		it("add one invalid dataset with malformed zip contents", function () {
			let malformedContent: string = getContentFromArchives("malformed.zip");

			return insightFacade.addDataset("courses", malformedContent, InsightDatasetKind.Courses)
				.catch(async (error: Error) => {
					const results = await insightFacade.listDatasets();
					expect(results).to.have.deep.members([]);

					expect(error).to.be.instanceOf(InsightError);
				});
		});

		it("remove existing dataset", async function () {

			await insightFacade.addDataset("courses", courseContent, InsightDatasetKind.Courses);
			const insightDatasetArray = await insightFacade.listDatasets();

			expect(insightDatasetArray).to.be.an.instanceOf(Array);
			expect(insightDatasetArray).to.have.length(1);
			expect(insightDatasetArray).to.deep.equal([
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);

			return insightFacade.removeDataset("courses").then(async (result: string) => {
				expect(result).to.deep.equal("courses");

				const datasets = await insightFacade.listDatasets();

				expect(datasets).to.have.length(0);
				expect(datasets).to.deep.equal([]);
			});
		});

		it("remove non-existent dataset", async function () {
			await insightFacade.addDataset("courses", courseContent, InsightDatasetKind.Courses);
			const insightDatasetArray = await insightFacade.listDatasets();

			expect(insightDatasetArray).to.be.an.instanceOf(Array);
			expect(insightDatasetArray).to.have.length(1);
			expect(insightDatasetArray).to.deep.equal([
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);

			const removeDatasetArray = insightFacade.removeDataset("courses-2");

			return removeDatasetArray.catch(async (error: Error) => {
				expect(error).to.be.instanceOf(NotFoundError);

				const currentArray = await insightFacade.listDatasets();

				expect(currentArray).to.have.length(1);
				expect(currentArray).to.deep.equal([
					{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					},
				]);
			});
		});

		it("remove dataset invalid id whitespaces", async function () {
			await insightFacade.addDataset("courses", courseContent, InsightDatasetKind.Courses);
			const insightDatasetArray = await insightFacade.listDatasets();

			expect(insightDatasetArray).to.be.an.instanceOf(Array);
			expect(insightDatasetArray).to.have.length(1);
			expect(insightDatasetArray).to.deep.equal([
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);

			return insightFacade.removeDataset("  ")
				.catch(async (error: Error) => {
					expect(error).to.be.instanceOf(InsightError);

					const currentArray = await insightFacade.listDatasets();

					expect(currentArray).to.have.length(1);
					expect(currentArray).to.deep.equal([
						{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 64612,
						},
					]);
				});
		});

		it("remove dataset invalid id whitespaces", async function () {
			await insightFacade.addDataset("courses", courseContent, InsightDatasetKind.Courses);
			const insightDatasetArray = await insightFacade.listDatasets();

			expect(insightDatasetArray).to.be.an.instanceOf(Array);
			expect(insightDatasetArray).to.have.length(1);
			expect(insightDatasetArray).to.deep.equal([
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);

			const removeDatasetArray = insightFacade.removeDataset("course_neat");

			return removeDatasetArray.catch(async (error: Error) => {
				expect(error).to.be.instanceOf(InsightError);

				const currentArray = await insightFacade.listDatasets();

				expect(currentArray).to.have.length(1);
				expect(currentArray).to.deep.equal([
					{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					},
				]);
			});
		});
	});


	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			insightFacade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDir);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries",
			{
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError(actual, expected) {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);
	});
});
