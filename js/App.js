// cache the canvas so we can get information about it later
var canvas_element;

var gfx = {
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
var activeRenderer;
var renderers;

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

var initMenus = function(width, height) {
    unitSidebar = document.createElement("div");
    unitInfo = document.createElement("div");
    unitInfo_name = document.createElement("div");
    unitInfo_legs = document.createElement("div");
    unitInfo_healthContainer = document.createElement("span");
    unitInfo_health = document.createElement("span");
    chatSidebar = document.createElement("div");

    gfx.width = width;
    gfx.height = height;

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

    document.getElementById("chatSidebar_land").appendChild(chatSidebar);

    document.getElementById("unitSidebar").style.height = (document.getElementById("canvas_land").height - 16);
    document.getElementById("chatSidebar").style.height = (document.getElementById("canvas_land").height - 16);
};

var setupContext = function(ctx) {
    ctx.imageSmoothingEnabled = false;

    return ctx;
};

var resizeCanvas = function(width, height) {
    $("#canvas_land").width(width);
    $("#canvas_land").height(height);
    canvas_element = $("#canvas_land");

    if (activeRenderer) {
        activeRenderer.resizeCanvases(width, height);
    } else {
        console.log("No active renderer to resize");
    }

    gfx.width = width;
    gfx.height = height;

    if (app !== undefined && app.inputs != undefined) {
        app.inputs.updateWindowSize(width, height);
    }

    if (camera !== undefined) {
        camera.resizeViewport(width, height);
    }
};
