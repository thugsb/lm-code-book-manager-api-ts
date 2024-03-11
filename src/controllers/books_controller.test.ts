import request from "supertest";
import { app } from "../app";
import { Book } from "../models/book";

import * as bookService from "../services/books";
jest.mock("../services/books");

afterEach(() => {
	jest.clearAllMocks();
});

const dummyBookData = [
	{
		bookId: 1,
		title: "The Hobbit",
		author: "J. R. R. Tolkien",
		description: "Someone finds a nice piece of jewellery while on holiday.",
	},
	{
		bookId: 2,
		title: "The Shop Before Life",
		author: "Neil Hughes",
		description:
			"Before being born, each person must visit the magical Shop Before Life, where they choose what kind of person they will become down on Earth...",
	},
];

describe("GET /api/v1/books endpoint", () => {
	test("status code successfully 200", async () => {
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("books successfully returned as empty array when no data returned from the service", async () => {
		// Arrange
		jest.spyOn(bookService, "getBooks").mockResolvedValue([]);
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual([]);
		expect(res.body.length).toEqual(0);
	});

	test("books successfully returned as array of books", async () => {
		// Arrange

		// NB the "as" to `Book[]` takes care of all the missing properties added by sequelize
		//    such as createdDate etc, that we don't care about for the purposes of this test
		jest
			.spyOn(bookService, "getBooks")
			.mockResolvedValue(dummyBookData as Book[]);

		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual(dummyBookData);
		expect(res.body.length).toEqual(2);
	});
});

describe("GET /api/v1/books/{bookId} endpoint", () => {
	test("status code successfully 200 for a book that is found", async () => {
		// Arrange
		const mockGetBook = jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("status code successfully 404 for a book that is not found", async () => {
		// Arrange

		jest
			.spyOn(bookService, "getBook")
			// this is a weird looking type assertion!
			// it's necessary because TS knows we can't actually return unknown here
			// BUT we want to check that in the event a book is missing we return a 404
			.mockResolvedValue(undefined as unknown as Book);
		// Act
		const res = await request(app).get("/api/v1/books/77");

		// Assert
		expect(res.statusCode).toEqual(404);
	});

	test("controller successfully returns book object as JSON", async () => {
		// Arrange
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.body).toEqual(dummyBookData[1]);
	});
});

describe("POST /api/v1/books endpoint", () => {
	test("status code successfully 201 for saving a valid book", async () => {
		// Arrange
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(undefined as unknown as Book);
		// Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: 56,
			title: "Fantastic Mr. Fox",
			author: "Roald Dahl",
		});

		// Assert
		expect(res.statusCode).toEqual(201);
	});

	test("status code 400 when saving ill formatted JSON", async () => {
		// Arrange - we can enforce throwing an exception by mocking the implementation
		jest.spyOn(bookService, "saveBook").mockImplementation(() => {
			throw new Error("Error saving book");
		});

		// Act
		const res = await request(app)
			.post("/api/v1/books")
			.send({ title: "Fantastic Mr. Fox", author: "Roald Dahl" }); // No bookId

		// Assert
		expect(res.statusCode).toEqual(400);
	});

	test("status code 400 when saving a book with a negative ID", async () => {
		// Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: -5,
			title: "Fantastic Mr. Fox",
			author: "Roald Dahl",
		});

		// Assert
		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual("The Book ID needs to be a positive integer.");
	});
	test("status code 400 when saving a book with a floating ID", async () => {
		// Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: 4.5,
			title: "Fantastic Mr. Fox",
			author: "Roald Dahl",
		});

		// Assert
		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual("The Book ID needs to be a positive integer.");
	});
	test("status code 400 when saving a book with a non-number ID", async () => {
		// Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: "QQQ",
			title: "Fantastic Mr. Fox",
			author: "Roald Dahl",
		});

		// Assert
		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual("The Book ID needs to be a positive integer.");
	});
	test("status code 400 when saving an existing book", async () => {
		// Arrange
		const mockGetBook = jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);
		// Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: 1,
			title: "Fantastic Mr. Fox",
			author: "Roald Dahl",
		});

		// Assert
		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual("A book with that ID already exists.");
	});
});

describe("DELETE /api/v1/books/{bookId} endpoint", () => {
	test("status code fail 400 if a non-Integer ID is given", async () => {
		// Arrange
		// Book.destroy() will return 1 if successful or 0 if not.
		jest.spyOn(bookService, "deleteBook").mockResolvedValue(0);

		// Act
		const res = await request(app).delete("/api/v1/books/df");

		// Assert
		expect(res.statusCode).toEqual(400);
		expect(res.body).toBe("Invalid book ID - must be a number");
	});
	test("status code successfully 204 for deleting an existing book", async () => {
		jest.spyOn(bookService, "deleteBook").mockResolvedValue(1);
		const res = await request(app).delete("/api/v1/books/1");

		// Assert
		expect(res.statusCode).toEqual(204);
	});
	test("status code fail 404 for deleting a non-existent book", async () => {
		jest.spyOn(bookService, "deleteBook").mockResolvedValue(0);
		const res = await request(app).delete("/api/v1/books/445");

		// Assert
		expect(res.statusCode).toEqual(404);
		expect(res.body).toBe("Book not found");
	});
});
