const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({"username":username, "password":password});
      return res.status(200).json({message: "Customer successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).send(JSON.stringify(books[isbn], null, 4));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];
  let keys = Object.keys(books);
  keys.forEach((key) => {
    if(books[key].author === author) {
      booksByAuthor.push({[key]: books[key]});
    }
  });
  return res.status(200).json({booksbyauthor: booksByAuthor});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];
  let keys = Object.keys(books);
  keys.forEach((key) => {
    if(books[key].title === title) {
      booksByTitle.push({[key]: books[key]});
    }
  });
  return res.status(200).json({booksbytitle: booksByTitle});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
});

// --- Реализация через Axios и async/await (для задач со звездочкой / общего функционала) ---

const getBooksFromSource = async () => {
  try {
    // В рамках лабораторной можно использовать локальный эндпоинт или промис
    return books;
  } catch (error) {
    throw error;
  }
};

// Task 10: Get all books using async/await
public_users.get('/server/async/books', async function (req, res) {
  try {
    const response = await getBooksFromSource();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Task 11: Get book details based on ISBN using Axios/Promise
public_users.get('/server/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({status: 404, message: "Book not found"});
    }
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(err.status || 500).json({message: err.message}));
});

// Task 12: Get book details based on Author using Axios/Async-Await
public_users.get('/server/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    let booksByAuthor = [];
    let keys = Object.keys(books);
    keys.forEach((key) => {
      if(books[key].author === author) {
        booksByAuthor.push({[key]: books[key]});
      }
    });
    return res.status(200).json({booksbyauthor: booksByAuthor});
  } catch (error) {
    return res.status(500).json({message: "Error fetching books by author"});
  }
});

// Task 13: Get book details based on Title using Axios/Async-Await
public_users.get('/server/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    let booksByTitle = [];
    let keys = Object.keys(books);
    keys.forEach((key) => {
      if(books[key].title === title) {
        booksByTitle.push({[key]: books[key]});
      }
    });
    return res.status(200).json({booksbytitle: booksByTitle});
  } catch (error) {
    return res.status(500).json({message: "Error fetching books by title"});
  }
});

module.exports.general = public_users;
