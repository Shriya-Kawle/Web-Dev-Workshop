// THIS WILL INITIALIZE THE SERVER AND ALSO GET,DELETE, OR POST THE DATA FROM "goodreads.db"
// first, we install the packages in the terminal
// when we run the code, make sure that the database file from where we get the data is present in the current working directory
const express = require("express"); // used to work on backend by creating an environment to work on it.
const path = require("path");
const { open } = require("sqlite");  // connects data to server
const sqlite3 = require("sqlite3"); // read db file and then connect it to the server
const cors = require("cors"); // solve authentication errors.


const app = express();
app.use(express.json()); // to compile the response

app.use(cors())

const dbpath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeServerAndDb = async (req, res) => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => { // assigning the port number as 3004 to the server
      console.log("Your server started on 3004"); // when the server is not connected properly
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
initializeServerAndDb();

app.get("/books", async (req, res) => {
  const getBookQuery = `
    SELECT * FROM book ORDER BY book_id;`;
  const booksArray = await db.all(getBookQuery);
  res.send(booksArray);
});
app.get("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const searchBookQuery = `
    SELECT * FROM book WHERE book_id = ${bookId};`;

  try {
    const book = await db.get(searchBookQuery);

    if (book) {
      res.send(book);
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/authors", async (req, res) => {
  const getAuthorQuery = `
    SELECT * FROM author ORDER BY author_id;`;
  const authorsArray = await db.all(getAuthorQuery);
  res.send(authorsArray);
});
app.get("/authors/:authorId", async (req, res) => {
  const { authorId } = req.params;
  const searchAuthorQuery = `
    SELECT * FROM author WHERE author_id = ${authorId};`;

  try {
    const author = await db.get(searchAuthorQuery);

    if (author) {
      res.send(author);
    } else {
      res.status(404).send("Author not found");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/books", async (req, res) => {
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbQuery = await db.run(addBookQuery);
  res.send("Congratulations, the Book is added Successfully");
});

app.put("/books/:bookId", async (req, res) => {
  const bookId = req.params.bookId;
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

  await db.run(updateBookQuery);
  res.send("The requested book with inputed bookId is updated");
});

app.delete("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;

  const deleteBookQuery = `
DELETE FROM
    book
WHERE
    book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  res.send("The requested book of mentioned Id is deleted");
});
