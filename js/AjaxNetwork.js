function AjaxNetwork() {
    function sendRequest(url, onComplete, data, method) {
        var requestMethod = method == null ? "GET" : method;
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
            }
            terrainTypes[cell.spriteName] = cell.cType;
        };
    }

    function sendGetViewWorldTemplate(callback) {
        sendRequest("/info/responses/viewWorld/", callback)
    }

    function handleGetViewWorldTemplate(response) {
        responseTemplates["viewWorld"] = response.responseJSON;
    }

    this.sendGetAllCells = sendGetAllCells;
    this.handleGetAllCells = handleGetAllCells;
    this.sendGetViewWorldTemplate = sendGetViewWorldTemplate;
    this.handleGetViewWorldTemplate = handleGetViewWorldTemplate;
}