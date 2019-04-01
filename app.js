var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    https = require('https'),
    app = express(),
    cors = require('cors'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    admin = require("firebase-admin"),
    serviceAccount = require("../ASAS-certs/asas-cloudteam-firebase-adminsdk-4oxdu-0115ceb4ac");

//Swagger modules
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');


//Models
var Actor = require('./api/models/actorModel'),
    Sponsorship = require('./api/models/sponsorshipModel'),
    Trip = require('./api/models/tripModel'),
    Finder = require('./api/models/finderModel'),
    Application = require('./api/models/applicationModel'),
    DataWareHouse = require('./api/models/dataWareHouseModel'),
    globalConfig = require('./api/models/globalConfigModel'),
    DataWareHouseTools = require('./api/controllers/dataWareHouseController');

/////CONFIGURATIONS
var port = process.env.PORT || 8080;

//HTTPS CERTS OPTIONS
/*const options = {
    key: fs.readFileSync('./keys/cloudTeamServer.key'),
    cert: fs.readFileSync('./keys/cloudTeamServer.cert')
};*/

// MongoDB URI building
var mongoDBUser = process.env.mongoDBUser || "admin";
var mongoDBPass = process.env.mongoDBPass || "admin";
var mongoDBCredentials = (mongoDBUser && mongoDBPass) ? mongoDBUser + ":" + mongoDBPass + "@" : "";

var mongoDBHostname = process.env.mongoDBHostname || "localhost";
var mongoDBPort = process.env.mongoDBPort || "27017";
var mongoDBName = process.env.mongoDBName || "ACME-Explorer";
var mongoDBURI = "mongodb://" + mongoDBCredentials + mongoDBHostname + ":" + mongoDBPort + "/" + mongoDBName;


mongoose.connect(mongoDBURI, {
    reconnectTries: 10,
    reconnectInterval: 500,
    poolSize: 10, // Up to 10 sockets
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // skip trying IPv6
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


//--------------FIREBASE CONFIGURATION----------------
//Fragmento de configuración del SDK de administración
var adminConfig = {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://asas-cloudteam.firebaseio.com'
};
admin.initializeApp(adminConfig);



//-------------------ROUTING-------------------------
var routesActors = require('./api/routes/actorRoutes');
var routesSponsorships = require('./api/routes/sponsorshipRoutes');
var routesTrips = require('./api/routes/tripRoutes');
var routesApplications = require('./api/routes/applicationRoutes');
var routesFinders = require('./api/routes/finderRoutes');
var routesDataWareHouse = require('./api/routes/dataWareHouseRoutes');
var routesLogin = require('./api/routes/loginRoutes');
var routesStore = require('./api/routes/storeRoutes');
var routesGlobalConfig = require('./api/routes/globalConfigRoutes');

routesFinders(app);
routesActors(app);
routesSponsorships(app);
routesTrips(app);
routesApplications(app);
routesDataWareHouse(app);
routesLogin(app);
routesStore(app);
routesGlobalConfig(app);


//------------------CONNECT TO MONGO-------------------
console.log("Connecting DB to: " + mongoDBURI);
mongoose.connection.on("open", function (err, conn) {
    app.listen(port, function () {
        console.log('ACME-Explorer-CloudTeam RESTful API server started on: http://localhost:' + port + "/");
    });
    //https.createServer(options, app).listen(port);
});

var publicFolder = path.join(__dirname, 'public');

app.use('/', express.static(publicFolder));

if (process.env.NODE_ENV == "PRODUCTION") {
    console.log(Date() + ": Production Mode");
    app.get("/", function (request, response) {
        response.sendFile(publicFolder + "/prod.html");
    });
} else {
    console.log(Date() + ": Development Mode");
    app.get("/", function (request, response) {
        response.sendFile(publicFolder + "/dev.html");
    });
}


mongoose.connection.on("error", function (err, conn) {
    console.error("DB init error " + err);
});

//Se crea por primera vez el trabajo CRON
DataWareHouseTools.createDataWareHouseJob();