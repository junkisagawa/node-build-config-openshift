var mode;

var modes;

function getMode() {
  console.log("called getMode");
  if (!sessionStorage.getItem("patientUImode")) {
    var url = "./mode";

    var http = new XMLHttpRequest();

    http.open("GET", url, true);

    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status == 200) {
        var patientdata = JSON.parse(http.responseText);
        console.log(http.responseText);
        var response = JSON.parse(http.responseText);
        modes = response.modes;
        mode = response.mode;
        sessionStorage.setItem("patientUImode", mode);
        sessionStorage.setItem("patientUImodes", modes);
      }
    };
    http.send(null);
  } else {
    mode = sessionStorage.getItem("patientUImode");
  }
}

function field_focus(field, email) {
  if (field.value == email) {
    field.value = "";
  }
}

function field_blur(field, email) {
  if (field.value == "") {
    field.value = email;
  }
}

function login() {
  console.log("In login");
  var mode = sessionStorage.getItem("patientUImode");
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  console.log("mode is " + mode);
  var url = "./login";
  var params =
    "username=" + username + "&password=" + password + "&mode=" + mode;

  var http = new XMLHttpRequest();

  http.open("POST", url + "?" + params, true);

  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == 200) {
      var patientid = JSON.parse(http.responseText);

      if (patientid.id) {
        sessionStorage.setItem("patientid", patientid.id);
        sessionStorage.setItem("patientusername", username);
      }

      window.location = "/";
      return;
    }
  };
  http.send(null);
}

function logout() {
  sessionStorage.removeItem("patientid");
  sessionStorage.removeItem("patientusername");
  window.location = "/login.html";
  return;
}
