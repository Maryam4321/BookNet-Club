// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var date = require("date-and-time");


module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      email: req.user.email,
      id: req.user.id
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function(req, res) {
    db.User.create({
      email: req.body.email,
      password: req.body.password
    })
      .then(function() {
        res.redirect(307, "/api/login");
      })
      .catch(function(err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function(req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  //BOOKS API
  app.get("/api/books", function(req, res) {
    db.Book.findAll().then(books => {
      res.json(books);
    });
  });

  app.get("/api/books/:weekID", function(req, res) {
    db.Book.findAll({where : {weekID : req.params.weekID}}).then(book => {
      res.json(book[0]);
    });
  });

  //COMMENTS API
  app.get("/api/comments/:weekID", function(req, res) {
    db.Comment.findAll({where : {bookID : req.params.weekID}}).then(comments => {
      res.json(comments);
    });
  });

  app.post("/api/comments/:weekID", function(req, res) {
    const now = new Date();

    const comment = {
      postedDate: date.format(now, "hh:mm A MMM DD YYYY"),
      bookID: req.params.weekID,
      posterName: req.body.posterName,
      body: req.body.body
    };
    db.Comment.create(comment);
    res.json(comment);
  });
};
