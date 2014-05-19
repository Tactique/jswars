// cache the canvas so we can get information about it later
var canvas;

var gfx = {
    ctx: null,
    width: 0,
    height: 0
};

var app;
var camera;
var network;
var ajaxNetwork;
var desiredPlayers;
var playerId;
var responseTemplates = {};

$(window).resize(function() {
    resizeCanvas($(window).width(), $(window).height());
});

var initialize = function() {
    // Call the sub apps initialize function
    innerInitialize();
};

var getPortNum = function() {
    return $("#wsport").text().slice(1);
};

var initCanvas = function(width, height) {

    canvas = document.createElement("canvas");
    unitSidebar = document.createElement("div");
    unitInfo = document.createElement("div");
    unitInfo_name = document.createElement("div");
    unitInfo_legs = document.createElement("div");
    unitInfo_healthContainer = document.createElement("span");
    unitInfo_health = document.createElement("span");
    chatSidebar = document.createElement("div");


    canvas.id = "canvas";
    unitSidebar.id = "unitSidebar";
    unitInfo.id = "unitInfo";
    unitInfo_name.id = "unitName";
    unitInfo_legs.id = "unitLegs";
    unitInfo_healthContainer.id = "unitHealthContainer";
    unitInfo_health.id = "unitHealth";
    chatSidebar.id = "chatSidebar";

    document.getElementById("unitSidebar_land").appendChild(unitSidebar);
        document.getElementById("unitSidebar").appendChild(unitInfo);
        document.getElementById("unitInfo").appendChild(unitInfo_name);
        document.getElementById("unitInfo").appendChild(unitInfo_legs);
        document.getElementById("unitInfo").appendChild(unitInfo_healthContainer);
            document.getElementById("unitHealthContainer").appendChild(unitInfo_health);

    document.getElementById("canvas_land").appendChild(canvas);

    document.getElementById("chatSidebar_land").appendChild(chatSidebar);


    resizeCanvas(width, height);
    document.getElementById("unitSidebar").style.height = (document.getElementById("canvas").height - 16);
    document.getElementById("chatSidebar").style.height = (document.getElementById("canvas").height - 16);

    gfx.ctx = setupContext(canvas.getContext("2d"));

    // we want the jquery version of this object, but that has to happen after
    // the initialization above
    canvas = $(canvas);
};

var setupContext = function(ctx) {
    ctx.imageSmoothingEnabled = false;

    return ctx;
};

var resizeCanvas = function(width, height) {
    var canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;

    gfx.width = canvas.width;
    gfx.height = canvas.height;

    gfx.ctx = setupContext(canvas.getContext("2d"));

    if (app !== undefined && app.inputs != undefined) {
        app.inputs.updateWindowSize(width, height);
    }

    if (camera !== undefined) {
        camera.resizeViewport(width, height);
    }
};
