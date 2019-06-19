var async = require("async");
var mongoose = require('mongoose'),
    DataWareHouse = mongoose.model('DataWareHouse'),
    Trips = mongoose.model('Trip'),
    Finders = mongoose.model('Finder'),
    Applications = mongoose.model('Application');


//Get Datawarehouse
exports.list_all_indicators = function (req, res) {

    console.log(Date() + 'GET /v1/DataWareHouse');
    DataWareHouse.find().sort("-computationMoment").exec(function (err, indicators) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(indicators);
        }
    });
};

//Get Last Indicator
exports.last_indicator = function (req, res) {

    console.log(Date() + 'GET /v1/dataWareHouse/latest');
    DataWareHouse.find().sort("-computationMoment").limit(1).exec(function (err, indicators) {
        if (err) {
            res.send(err);
        }
        else {
            res.json(indicators);
        }
    });
};

//Importaciones para CRON
var CronJob = require('cron').CronJob;
var CronTime = require('cron').CronTime;

//'0 0 * * * *' una hora
//'*/30 * * * * *' cada 30 segundos
//'*/10 * * * * *' cada 10 segundos
//'* * * * * *' cada segundo
//Periodo por defecto en el que se van a ejecutar todas estas agregaciones.
//En este ejemplo se recomputan las agregaciones cada 10 segundos (No recomendable con grandes volumenes de datos)
var rebuildPeriod = '0 0 * * * *';  //El que se usará por defecto
var computeDataWareHouseJob;

//Contesta a la petición post en la que un administrador puede indicar un nuevo periodo de computación
exports.rebuildPeriod = function (req, res) {

    console.log(Date() + 'POST /v1/DataWareHouse');
    console.log('Updating rebuild period. Request: period:' + req.query.rebuildPeriod);
    rebuildPeriod = req.query.rebuildPeriod;
    computeDataWareHouseJob.setTime(new CronTime(rebuildPeriod));
    computeDataWareHouseJob.start();

    res.json(req.query.rebuildPeriod);
};


//Crea el trabajo CRON (lo da de alta con el periodo por defecto)
//Esta función se lanza siempre al principio de la aplicación, después de conectar con la base de datos (app.js)

function createDataWareHouseJob() {

    //Doy de alta el CRON y le indico la periodicidad (defecto: 10 seg)
    computeDataWareHouseJob = new CronJob(rebuildPeriod, function () {

        var new_dataWareHouse = new DataWareHouse();
        console.log('Cron job submitted. Rebuild period: ' + rebuildPeriod);
        //Se ejecutan todas las funciones de forma paralela
        async.parallel([
            computeTripsManagerStats,
            computeApplicationsTripStats,
            computePriceTripStats,
            computeApplicationsRatioPerStatus,
            computeAveragePriceFinderStats,
            computeTopKeywordsFinderStats
        ], function (err, results) { //Función que recoje los resultados de las computaciones anteriores
            if (err) {
                console.log("Error computing datawarehouse: " + err);
            }
            else {
                //Se almacenan los resultados de la computaciones y los guardo en el datawarehouse
                //console.log("Resultados obtenidos por las agregaciones: "+JSON.stringify(results));
                new_dataWareHouse.tripsManagerStats = results[0];
                new_dataWareHouse.applicationsTripStats = results[1];
                new_dataWareHouse.priceTripStats = results[2];
                new_dataWareHouse.applicationsRatioPerStatus = results[3];
                new_dataWareHouse.averagePriceFinderStats = results[4];
                new_dataWareHouse.topKeywordsFinderStats = results[5];
                new_dataWareHouse.rebuildPeriod = rebuildPeriod;

                new_dataWareHouse.save(function (err, datawarehouse) {
                    if (err) {
                        console.log("Error saving datawarehouse: " + err);
                    }
                    else {
                        console.log(Date() + ": new DataWareHouse succesfully saved. Date: " + new Date());
                        //console.log(datawarehouse);
                    }
                });
            }
        });
    }, null, true, 'Europe/Madrid');
}

//Use for create CRON JOB for first time in app.js
module.exports.createDataWareHouseJob = createDataWareHouseJob;


//La media, minimo, máximo y desviación estándar del número de viajes controlados por manager.
function computeTripsManagerStats(callback) {
    //console.log("Ejecuta computeTripsManagerStats");
    Trips.aggregate([
        {
            $group: {
                _id: "managerID",
                tripbyactor: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: 0,
                avg: { $avg: "$tripbyactor" },
                min: { $min: "$tripbyactor" },
                max: { $max: "$tripbyactor" },
                stdev: { $stdDevPop: "$tripbyactor" }
            }
        },
        { $project: { _id: 0 } }
    ], function (err, res) {
        callback(err, res[0]);
    });

};

//La media, mínimo, máximo y desviación estándar del número de aplicaciones por viaje.

function computeApplicationsTripStats(callback) {
    //console.log("Ejecuta computeApplicationsTripStats");

    Applications.aggregate([
        { $group: { _id: "$tripID", applicationTrips: { $sum: 1 } } },
        {
            $group: {
                _id: 0,
                avg: { $avg: "$applicationTrips" },
                min: { $min: "$applicationTrips" },
                max: { $max: "$applicationTrips" },
                stdev: { $stdDevPop: "$applicationTrips" }
            }
        }
    ], function (err, res) {
        callback(err, res[0]);
    });

};

//La media, mínimo, máximo y desviación estándar del precio de los viajes.

function computePriceTripStats(callback) {
    //console.log("Ejecuta computePriceTripStats");

    Trips.aggregate([
        {
            $group: {
                _id: "$price",
                tripsactor: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: 0, avg:
                    { $avg: "$tripsactor" },
                min: { $min: "$tripsactor" },
                max: { $max: "$tripsactor" },
                stdev: { $stdDevPop: "$tripsactor" }
            }
        }
    ], function (err, res) {
        callback(err, res[0])
    });
};

//El ratio de aplicaciones agrupadas por estado (DUE, PENDING, ACCEPTED...).

function computeApplicationsRatioPerStatus(callback) {
    //console.log("Ejecuta computeApplicationsRatioPerStatus");

    Applications.aggregate([
        {
            $facet: {
                totalApplications: [{ $group: { _id: null, totalapplicationsTotals: { $sum: 1 } } }],
                groups: [{ $group: { _id: "$status", total: { $sum: 1 } } }],
            }
        },
        { $project: { _id: 0, groupsTotal: "$groups", totalApplications: "$totalApplications.totalapplicationsTotals" } },
        { $unwind: "$totalApplications" },
        { $unwind: "$groupsTotal" },
        { $project: { _id: 0, status: "$groupsTotal._id", ratio: { $divide: ["$groupsTotal.total", "$totalApplications"] } } }
    ], function (err, res) {
        callback(err, res[0])
    });
};

//La media de priceMax y priceMin que los explorers indican en sus búsquedas.
function computeAveragePriceFinderStats(callback) {

    Finders.aggregate([
        { $group: { _id: "$explorerID", total: { $sum: 1 } } },
        {
            $group: {
                _id: 0,
                avg: { $avg: "$priceMin" },
                avg: { $avg: "$priceMax" }
            }
        }
    ], function (err, res) {
        callback(err, res[0]);
    });
}


//Una lista con las 10 keywords más repetidas en las búsquedas, ordenadas de mayor a menor.
function computeTopKeywordsFinderStats(callback) {

    Finders.aggregate(
        [
            { $sort: { keyword: 1 } },
            { $limit: 10 },
            {
                $group: {
                    _id: '$keyword',
                    total: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ], function (err, res) {
            callback(err, res[0]);
        });
};