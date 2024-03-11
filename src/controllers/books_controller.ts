import { Request, Response } from "express";
import * as bookService from "../services/books";

export const getBooks = async (req: Request, res: Response) => {
	const books = await bookService.getBooks();
	res.json(books).status(200);
};

export const getBook = async (req: Request, res: Response) => {
	const bookId = req.params.bookId;
	const book = await bookService.getBook(Number(bookId));

	if (book) {
		res.json(book).status(200);
	} else {
		res.status(404).json("Not found");
	}
};

export const saveBook = async (req: Request, res: Response) => {
	const bookToBeSaved = req.body;
	const bookId = bookToBeSaved.bookId;

	if (Number.isNaN(bookId) || !Number.isInteger(bookId) || Number(bookId) < 1) {
		res.status(400).json("The Book ID needs to be a positive integer.");
	} else {
		const book = await bookService.getBook(1);
		if (book) {
			res.status(400).json("A book with that ID already exists.");
		} else {
			try {
				const book = await bookService.saveBook(bookToBeSaved);
				res.status(201).json(book);
			} catch (error) {
				res.status(400).json({ message: (error as Error).message });
			}
		}
	}
};

// User Story 4 - Update Book By Id Solution
export const updateBook = async (req: Request, res: Response) => {
	const bookUpdateData = req.body;
	const bookId = Number.parseInt(req.params.bookId);

	const book = await bookService.updateBook(bookId, bookUpdateData);
	res.status(204).json(book);
};

// US5 - Deleting
export const deleteBook = async (req: Request, res: Response) => {
	const bookId = Number.parseInt(req.params.bookId);
	if (Number.isNaN(bookId)) {
		res.status(400).json("Invalid book ID - must be a number");
	} else {
		const returnedValue = await bookService.deleteBook(bookId);
		if (returnedValue) {
			res.status(204).send();
		} else {
			res.status(404).json("Book not found");
		}
	}
};
