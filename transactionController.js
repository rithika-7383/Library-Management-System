const Transaction = require("../models/Transaction");
const Book = require("../models/Book");

const fineFor = (dueDate, returnDate = new Date()) => {
  const lateMs = new Date(returnDate) - new Date(dueDate);
  const lateDays = Math.max(0, Math.ceil(lateMs / (1000 * 60 * 60 * 24)));
  return lateDays * Number(process.env.FINE_PER_DAY || 5);
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, userId, days = 14 } = req.body;
    const borrower = userId || req.user._id;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.availableCopies < 1)
      return res.status(400).json({ message: "No copies available" });

    const active = await Transaction.findOne({ book: bookId, user: borrower, status: "issued" });
    if (active) return res.status(400).json({ message: "This user already has this book issued" });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(days));

    const transaction = await Transaction.create({
      user: borrower, book: bookId, dueDate
    });
    book.availableCopies -= 1;
    await book.save();

    await transaction.populate("user", "name email");
    await transaction.populate("book", "title author isbn");
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const transactions = await Transaction.find(filter)
      .populate("user", "name email")
      .populate("book", "title author isbn")
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.status === "returned")
      return res.status(400).json({ message: "Book already returned" });
    if (req.user.role !== "admin" && String(transaction.user) !== String(req.user._id))
      return res.status(403).json({ message: "Not allowed" });

    const returnDate = new Date();
    transaction.returnDate = returnDate;
    transaction.fine = fineFor(transaction.dueDate, returnDate);
    transaction.status = "returned";
    await transaction.save();

    const book = await Book.findById(transaction.book);
    if (book) {
      book.availableCopies = Math.min(book.quantity, book.availableCopies + 1);
      await book.save();
    }

    await transaction.populate("user", "name email");
    await transaction.populate("book", "title author isbn");
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const [books, users, issued, returned] = await Promise.all([
      Book.countDocuments(),
      require("../models/User").countDocuments({ role: "student" }),
      Transaction.countDocuments({ status: "issued" }),
      Transaction.countDocuments({ status: "returned" })
    ]);
    const activeFineAgg = await Transaction.aggregate([
      { $match: { status: "issued" } },
      { $project: {
          overdue: { $cond: [{ $gt: [new Date(), "$dueDate"] }, 1, 0] },
          dueDate: 1
      }},
      { $match: { overdue: 1 } }
    ]);
    res.json({ books, users, issued, returned, overdue: activeFineAgg.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
