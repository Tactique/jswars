var renderers = {};

// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function Renderer(width, height, destination) {
    // This contains all the graphics contexts which can render to their specific
    // layers. All contexts are overlapped on the screen, and have the same overall
    // width and height
    var contextLayers = {
        spriteLayer: new LayerRenderer(),
        backgroundLayer: new LayerRenderer(),
        foregroundLayer: new LayerRenderer(),
    };

    var width = width;
    var height = height;

    initializeContexts(width, height, destination);

    function LayerRenderer() {
        this.canvas = null;
        this.ctx = null;
        this.valid = false;
        this.renderingTasks = {};

        this.render = function(width, height, renderable) {
            if (!this.valid) {
                this.clearLayer(width, height);

                for (var functionName in this.renderingTasks) {
                    this.renderingTasks[functionName](this.ctx, renderable);
                }
            }
            this.valid = true;
        }

        // Rendering tasks are functions that use a graphics context to render
        // something. Tasks must be of the form:
        //      task(context, renderable)
        this.registerTask = function(functionName, renderFunc) {
            this.renderingTasks[functionName] = renderFunc;
        }

        this.removeTask = function(functionName) {
            delete this.renderingTasks[functionName];
        }

        this.invalidate = function() {
            this.valid = false;
        }

        this.clearLayer = function(width, height) {
            this.ctx.clearRect(0, 0, width, height);
        }

        this.resize = function(width, height) {
            this.canvas.width = width;
            this.canvas.height = height;

            this.ctx = setupContext(this.canvas.getContext("2d"));
            this.valid = false;
        }
    }

    function initializeContexts(width, height, destination) {
        console.log(contextLayers);
        // This should be able to reuse canvases if they already exist
        // Some CSS fudging will have to happen here to get the canvases to overlap
        initLayer("backgroundLayer", width, height, destination);
        initLayer("spriteLayer", width, height, destination);
        initLayer("foregroundLayer", width, height, destination);
    }

    function initLayer(layerName, width, height, destination) {
        var canvas = document.getElementById(layerName) || document.createElement("canvas");
        canvas.id = layerName;
        contextLayers[layerName].canvas = canvas;
        contextLayers[layerName].ctx = setupContext(canvas.getContext("2d"));
        contextLayers[layerName].resize(width, height);
        if (!document.getElementById(layerName)) {
            document.getElementById(destination).appendChild(canvas);
        }        
        console.log("initLayer", contextLayers);
    }

    // Intelligent rendering function. Makes rendering calls only for layers
    // that require it
    this.render = function(renderable) {
        contextLayers.backgroundLayer.render(width, height, renderable);
        contextLayers.spriteLayer.render(width, height, renderable);
        contextLayers.foregroundLayer.render(width, height, renderable);
    }

    function registerLayerTask(layerName, functionName, renderFunc) {
        contextLayers[layerName].registerTask(functionName, renderFunc);
    }

    this.registerSpriteLayerTask = function(functionName, renderfunc) {
        registerLayerTask("spriteLayer", functionName, renderfunc);
    }

    this.registerBackgroundLayerTask = function(functionName, renderfunc) {
        registerLayerTask("backgroundLayer", functionName, renderfunc);
    }

    this.registerForegroundLayerTask = function(functionName, renderfunc) {
        registerLayerTask("foregroundLayer", functionName, renderfunc);
    }

    function removeLayerTask(layerName, functionName) {
        contextLayers[layerName].removeTask(functionName);
    }

    this.removeSpriteLayerTask = function(functionName) {
        removeLayerTask("spriteLayer", functionName);
    }

    this.removeBackgroundLayerTask = function(functionName) {
        removeLayerTask("backgroundLayer", functionName);
    }

    this.removeForegroundLayerTask = function(functionName) {
        removeLayerTask("foregroundLayer", functionName);
    }

    function invalidateLayer(layerName) {
        contextLayers[layerName].invalidate();
    }

    this.invalidateSpriteLayer = function() {
        invalidateLayer("spriteLayer");
    }

    this.invalidateBackgroundLayer = function() {
        invalidateLayer("backgroundLayer");
    }

    this.invalidateForegroundLayer = function() {
        invalidateLayer("foregroundLayer");
    }

    this.invalidateAllLayers = function() {
        this.invalidateBackgroundLayer();
        this.invalidateForegroundLayer();
        this.invalidateSpriteLayer();
    }

    this.resizeCanvases = function(width, height) {
        console.log("resizeCanvases", contextLayers);
        contextLayers.backgroundLayer.resize(width, height);
        contextLayers.spriteLayer.resize(width, height);
        contextLayers.foregroundLayer.resize(width, height);

        width = width;
        height = height;
    }
}

function SpecialRenderer() {
    function addLayer(key, priority, renderfunc, renderable) {
        renderer = {
            key: key,
            priority: priority,
            rfunc: renderfunc.bind(null, renderable)
        };
        renderers.push(renderer);
    }

    function removeLayer(key) {
        // renderers are wrapped in objects which contain a key, so an
        // object needs to be created and passed here to delete
        renderers.remove({key: key});
    }

    function render() {
        for (var i = renderers.content.length - 1; i >= 0 ; i--) {
            renderers.content[i].rfunc();
        }
    }

    function rendererScore(r) {
        return r.priority;
    }

    function rendererEquality(r1, r2) {
        return r1.key == r2.key;
    }

    var renderers = new BinaryHeap(rendererScore, rendererEquality);

    this.addLayer = function(key, priority, renderfunc, renderable) {
        addLayer(key, priority, renderfunc, renderable);
    };

    this.removeLayer = function(key) {
        removeLayer(key);
    };

    this.render = function() {
        render();
    };
}

var specialRenderer = new SpecialRenderer();

function clearBack() {
    gfx.ctx.fillStyle = "#FFFFFF";
    gfx.ctx.fillRect(0, 0, gfx.width, gfx.height);
}

function drawLine(ctx, sx, sy, dx, dy) {
    ctx.moveTo(sx, sy);
    ctx.lineTo(dx, dy);
}

function drawMenu(ctx) {
    // TODO actually render something for the menu
}

function handleSelectorRendering(selector) {
    specialRenderer.removeLayer("selector");
    assets.spriteManager.getSprite("selector").animate = true;
    specialRenderer.addLayer("selector", 1, drawSelector, selector);
}

function drawWorld() {
    drawEnvironment(app.world);

    drawGrid(app.world);

    drawUnits(app.world);

    specialRenderer.render();
}

function drawEnvironment(ctx, world) {
    for (var x = 0; x < world.getWidth(); x++) {
        for (var y = 0; y < world.getHeight(); y++) {
            var current_cell = world.getCell(x, y);
            drawSprite(ctx, x, y, current_cell.spriteName);
        }
    }
}

function drawUnits(ctx, world) {
    var units = world.getUnits();
    for (var i in units) {
        var position = assets.spriteManager.getSprite(units[i].spriteName).drawPos;
        drawSprite(ctx, position.x, position.y, units[i].spriteName);
    }
}

function drawSelector(selector) {
    var position = selector.pos;
    drawSprite(position.x, position.y, selector.spriteName);
}

function drawSprite(ctx, x, y, spriteName) {
    var cam_pos = camera.transformToCameraSpace(x, y);
    if (camera.positionVisible(cam_pos.cam_x, cam_pos.cam_y)) {
        var sprite = assets.spriteManager.getSprite(spriteName);
        var img = sprite.getSpriteImg();
        var pos = sprite.getFramePosition(x, y);

        var rel_width = sprite.width / assets.spriteManager.minWidth;
        var rel_height = sprite.height / assets.spriteManager.minHeight;
        var cam_size = camera.multZoomFactor(rel_width, rel_height);
        var centered_offset = camera.multZoomFactor(rel_width - 1.0,
                                                    rel_height - 1.0);
        centered_offset.cam_w = centered_offset.cam_w / 2;
        centered_offset.cam_h = centered_offset.cam_h / 2;

        ctx.drawImage(img,
                      pos.x, pos.y,
                      sprite.width, sprite.height,
                      cam_pos.cam_x - centered_offset.cam_w,
                      cam_pos.cam_y - centered_offset.cam_h,
                      cam_size.cam_w, cam_size.cam_h);
    }
}

function drawGrid(ctx, world) {
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    for (var x = 0; x <= world.getWidth(); x++) {
        var draw_x = camera.transformToCameraSpace(x, 0).cam_x;
        var top = camera.transformToCameraSpace(x, 0).cam_y;
        var bot = camera.transformToCameraSpace(x, world.getHeight()).cam_y;
        drawLine(ctx, draw_x, top, draw_x, bot);
    }

    for (var y = 0; y <= world.getHeight(); y++) {
        var draw_y = camera.transformToCameraSpace(0, y).cam_y;
        var left = camera.transformToCameraSpace(0, y).cam_x;
        var right = camera.transformToCameraSpace(world.getWidth(), y).cam_x;
        drawLine(ctx, left, draw_y, right, draw_y);
    }
    ctx.stroke();
}

function render(renderable) {
    activeRenderer = renderers[app.currentState];
    renderers[app.currentState].render(renderable);
}
