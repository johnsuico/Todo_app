const   express                 = require("express"),
        app                     = express(),
        bodyParser              = require("body-parser"),
        mongoose                = require("mongoose"),
        passport                = require("passport"),
        LocalStrategy           = require("passport-local"),
        methodOverride          = require("method-override");


// Database connection
mongoose.connect("mongodb+srv://johnsuico:Random12@cluster0-mukjb.mongodb.net/<dbname>?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// Models
const   Task    = require("./models/tasks");
const   User    = require("./models/user");

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

// Passport Configuration
app.use(require("express-session")({
    secret: "!todoappsecretkey!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Passing through currentUser data to all routes
app.use( (req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Get the homepage
app.get("/", (req, res) => {
    res.render("index");
});

// Get Task Tracker Page (Landing page)
app.get("/tasktracker/", isLoggedIn, (req, res) => {
    // Get all tasks
    Task.find({}, (err, task) => {
        if(err) {
            console.log(err);
        } else {
            res.render("landing", {task: task, currentUser: req.user});
        }
    });
});

// Task Tracker Create
app.post("/tasktracker", (req, res) => {
    // Create new task and save to database
    let newTask = {task: req.body.task}
    Task.create(newTask, (err, newlyCreated) => {
        if(err) {
            console.log(err);
        } else {
            // add username to task to associate with each user
            newlyCreated.author.id = req.user._id;
            newlyCreated.save();
            res.redirect("/tasktracker");
        }
    });
});

// Task tracker edit
app.get("/tasktracker/:id/edit", (req, res) => {
    res.render("editTask");
});

// Task Tracker Delete
app.delete("/tasktracker/:id", (req, res) => {
    Task.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/tasktracker");
        }
    });
});

// =========================
// Auth Routes
// =========================

// Show signup form
app.get("/signup", (req, res) => {
    res.render("signup");
})

// Handle Signup Logic
app.post("/signup", (req, res) => {
    let newUser = new User({username: req.body.username});
    let newPass = req.body.password;
    User.register(newUser, newPass, (err, user) => {
        if(err) {
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/tasktracker");
        });
    });
});

// Login Form
app.get("/login", (req, res) => {
    res.render("login");
});

// Handle Login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/tasktracker",
        failureRedirect: "/login"
    }),(req, res) => {
});

// Logout Route
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

//Start server
app.listen(process.env.PORT || 3000, () => {
    console.log("Todo app server has started.");
});