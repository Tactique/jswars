function AjaxNetwork() {
    function sendRequest(url, onComplete, data, method) {
        var requestMethod = method === null ? "GET" : method;
        var headers = {};
        if (requestMethod == "POST") {
            headers["X-CSRFToken"] = $.cookie("csrftoken");
        }
        $.ajax({
            url: url,
            type: requestMethod,
            headers: headers,
            dataType: 'json',
            complete: onComplete,
            data: data,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error sending request to url(" + url + "): ",
                            errorThrown);
            }
        });
    }

    function sendGetAllCells(callback) {
        sendRequest("/info/cell/", callback);
    }

    function handleGetAllCells(response) {
        terrainTable = new Array(response.responseJSON.length);
        for (var i = response.responseJSON.length - 1; i >= 0; i--) {
            var cell = response.responseJSON[i].fields;
            terrainTable[cell.cType] = function(x, y) {
                return new Cell(x, y, cell.spriteName, cell.cType);
            };
            terrainTypes[cell.spriteName] = cell.cType;
        }
    }

    function sendGetTemplate(name, callback) {
        sendRequest("/info/responses/" + name + "/", callback);
    }

    function handleGetTemplate(name, response) {
        responseTemplates[name] = response.responseJSON;
    }

    function getAllTemplates(callback) {
        var tempTaskQueue = new TaskQueue(callback);
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "viewWorld"),
                                  handleGetTemplate.bind(this, "viewWorld"),
                                  "viewWorld");
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "viewUnits"),
                                  handleGetTemplate.bind(this, "viewUnits"),
                                  "viewUnits");
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "viewTerrain"),
                                  handleGetTemplate.bind(this, "viewTerrain"),
                                  "viewTerrain");
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "viewPlayers"),
                                  handleGetTemplate.bind(this, "viewPlayers"),
                                  "viewPlayers");
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "turn"),
                                  handleGetTemplate.bind(this, "turn"),
                                  "turn");
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "new"),
                                  handleGetTemplate.bind(this, "new"),
                                  "new");
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "move"),
                                  handleGetTemplate.bind(this, "move"),
                                  "move");
        tempTaskQueue.enqueueTask(sendGetTemplate.bind(this, "attack"),
                                  handleGetTemplate.bind(this, "attack"),
                                  "attack");
        tempTaskQueue.executeTasks();
    }

    function sendLogin(form) {
        sendRequest("/login/", this.handleLogin, form.serialize(), "POST");
    }

    function handleLogin(response) {
        // if we received a token in our response, we've been "logged in"
        if (response.status == 200) {
            $.cookie("token", response.responseJSON.token);
            window.location.replace("/play/");
        } else {
            // TODO: is this XSS-able?
            $("#login_error").html("<div class='alert alert-danger'>"+ response.responseText + "</div>");
        }
    }

    function sendRegister(form) {
        sendRequest("/register/", this.handleLogin, form.serialize(), "POST");
    }

    function sendLogout() {
        sendRequest("/logout/", this.handleLogout, null, "POST");
    }

    function handleLogout(response) {
        window.location.replace("/");
    }

    this.sendGetAllCells = sendGetAllCells;
    this.handleGetAllCells = handleGetAllCells;
    this.sendGetTemplate = sendGetTemplate;
    this.handleGetTemplate = handleGetTemplate;
    this.getAllTemplates = getAllTemplates;
    this.sendLogin = sendLogin;
    this.handleLogin = handleLogin;
    this.sendLogout = sendLogout;
    this.handleLogout = handleLogout;
    this.sendRegister = sendRegister;
}
