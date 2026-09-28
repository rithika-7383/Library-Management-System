const Book = require("../models/Book");

exports.getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } }
      ];
    }
    if (category) filter.category = category;
    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, publisher, year, quantity } = req.body;
    const book = await Book.create({
      title, author, isbn, category, publisher, year,
      quantity: Number(quantity),
      availableCopies: Number(quantity)
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.code === 11000 ? "ISBN already exists" : error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const { title, author, isbn, category, publisher, year, quantity } = req.body;
    if (quantity !== undefined) {
      const newQty = Number(quantity);
      const issued = book.quantity - book.availableCopies;
      if (newQty < issued)
        return res.status(400).json({ message: `Quantity cannot be less than issued copies (${issued})` });
      book.quantity = newQty;
      book.availableCopies = newQty - issued;
    }
    Object.assign(book, { title, author, isbn, category, publisher, year });
    await book.save();
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.code === 11000 ? "ISBN already exists" : error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const Transaction = require("../models/Transaction");
    const active = await Transaction.findOne({ book: req.params.id, status: "issued" });
    if (active) return res.status(400).json({ message: "Cannot delete a book with an active issue" });
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
