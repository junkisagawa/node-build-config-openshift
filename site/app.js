/* dependency setup */
process.env.UV_THREADPOOL_SIZE = 128;

var express = require("express");
var bodyParser = require("body-parser");
var log4js = require("log4js");

log4js.addLayout("json", function (config) {
  return function (logEvent) {
    return JSON.stringify(logEvent) + config.separator;
  };
});

log4js.configure({
  appenders: {
    out: { type: "stdout", layout: { type: "json", separator: "," } },
  },
  categories: {
    default: { appenders: ["out"], level: "info" },
  },
});

var logger = log4js.getLogger();
var backendApi = require("./backendApi");

logger.level = "debug";
logger.debug("launching Example health endpoint");

/* end of dependency setup */

var port = process.env.PORT || 8080;

var app = express();

MODE = {
  TEST: 1,
  Z: 2,
  OPENSHIFT: 3,
};

var CURRENTMODE = MODE.TEST;

var API_URL = "";

app.post("/mode", function (req, res) {
  logger.debug("called the mode endpoint with mode: " + req.query.mode);
  logger.debug("called the mode endpoint with url: " + req.query.url);
  CURRENTMODE = req.query.mode;
  API_URL = req.query.url;
  res.send({ modes: MODE, mode: CURRENTMODE });
});

app.get("/mode", function (req, res) {
  logger.debug(`set the Mode ${CURRENTMODE}`);
  res.send({ modes: MODE, mode: CURRENTMODE });
});

app.get("/info", function (req, res) {
  logger.debug("called the information endpoint for " + req.query.id);
  logger.info({ event: "info" });
  var patientdata;

  if (CURRENTMODE == MODE.TEST || req.query.id == "test") {
    patientdata = {
      personal: {
        name: "Ralph DAlmeida",
        age: 38,
        gender: "male",
        street: "34 Main Street",
        city: "Toronto",
        zipcode: "M5H 1T1",
      },
      medications: ["Metoprolol", "ACE inhibitors", "Vitamin D"],
      appointments: [
        "2018-01-15 1:00 - Dentist",
        "2018-02-14 4:00 - Internal Medicine",
        "2018-09-30 8:00 - Pediatry",
      ],
    };

    res.send(patientdata);
  } else {
    patientdata = {
      personal: {},
      medications: [],
      appointments: [],
    };

    patientInfo = backendApi.getPatientInfo(API_URL, req.query.id);
    patientMedications = backendApi.getPatientMedications(
      API_URL,
      req.query.id
    );
    patientAppointments = backendApi.getPatientAppointments(
      API_URL,
      req.query.id
    );

    patientInfo.then(function (patientInfoResult) {
      patientdata.personal = patientInfoResult;

      patientMedications.then(function (patientMedicationsResult) {
        patientdata.medications = patientMedicationsResult;

        patientAppointments.then(function (patientAppointmentsResult) {
          patientdata.appointments = patientAppointmentsResult;

          res.send(patientdata);
        });
      });
    });
  }
});

app.get("/measurements", function (req, res) {
  logger.debug("called the measurements endpoint for " + req.query.id);

  var measurements;

  if (CURRENTMODE == MODE.TEST) {
    measurements = {
      smokerstatus: "Former smoker",
      dia: 88,
      sys: 130,
      bmi: 19.74,
      bmirange: "normal",
      weight: 54.42,
      height: 1.6603,
    };

    res.send(measurements);
  } else {
    patientMeasurements = backendApi.getPatientMeasurements(
      API_URL,
      req.query.id
    );

    patientMeasurements.then(function (patientMeasurementsResult) {
      measurements = patientMeasurementsResult;
      res.send(measurements);
    });
  }
});

app.post("/login", function (req, res) {
  const name = req.query.username;
  const password = req.query.password;
  const mode = req.query.mode;
  logger.debug("called the login endpoint for " + name + "with mode " + mode);
  if (req.query.mode != 1) {
    patientLogin = backendApi.patientLogin(
      API_URL,
      req.query.username,
      req.query.password
    );
    patientLogin.then(function (id) {
      logger.info({ event: "login", userName: name, mode: mode, userId: id });
      res.send({
        id: id,
      });
    });
  } else {
    logger.debug("test mode login");
    var jsonLog = {
      event: "login",
      userName: name,
      mode: mode,
    };
    console.log(JSON.stringify(jsonLog));
    res.send({ id: "test" });
  }
});

// Bootstrap application settings
app.use(express.static("./public")); // load UI from public folder
app.use(bodyParser.json());

app.listen(port);
logger.debug("Listening on port ", port);
