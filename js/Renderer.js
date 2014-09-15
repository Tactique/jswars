var renderers = {
    "CAMERA_CONTROL": drawWorld,
    "UNIT_CONTROL": drawWorld,
    "MENU_CONTROL" : drawMenu,
    "CELL_PLACEMENT": drawWorld
};

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

    function LayerRenderer() {
        this.canvas = null;
        this.ctx = null;
        this.valid = false;
        this.renderingTasks = [];

        this.render = function(width, height) {
            if (!this.valid) {
                this.clearLayer(width, height);

                for (var i = 0; i < this.renderingTasks.length; i++) {
                    this.renderingTasks[i](this.ctx, width, height);
                }
            }
            this.valid = true;
        }

        // Rendering tasks are functions that use a graphics context to render
        // something. As such they must be of the form:
        //      renderTask(bound arguments..., context, width, height)
        this.registerTask = function(renderFunc) {
            this.renderingTasks.push(renderFunc);
        }

        this.invalidate = function() {
            this.valid = false;
        }

        this.clearLayer = function(width, height) {
            this.ctx.clearRect(0, 0, width, height);
        }
    }

    function initializeContexts(width, height, destination) {
        var canvas = document.createElement("canvas");
        canvas.id = "spriteLayer";
        contextLayers.spriteLayer.canvas = canvas;
        contextLayers.spriteLayer.ctx = setupContext(canvas.getContext("2d"));
        document.getElementById("canvas_land").appendChild(canvas);

        canvas = document.createElement("canvas");
        canvas.id = "backgroundLayer";
        contextLayers.backgroundLayer.canvas = canvas;
        contextLayers.backgroundLayer.ctx = setupContext(canvas.getContext("2d"));
        document.getElementById("canvas_land").appendChild(canvas);

        canvas = document.createElement("canvas");
        canvas.id = "foregroundLayer";
        contextLayers.foregroundLayer.canvas = canvas;
        contextLayers.foregroundLayer.ctx = setupContext(canvas.getContext("2d"));
        document.getElementById("canvas_land").appendChild(canvas);

        width = width;
        height = height;
    }

    // Intelligent rendering function. Makes rendering calls only for layers
    // that require it
    function render() {
        contextLayers.backgroundLayer.render(width, height);
        contextLayers.spriteLayer.render(width, height);
        contextLayers.foregroundLayer.render(width, height);
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

function drawLine(sx, sy, dx, dy) {
    gfx.ctx.moveTo(sx, sy);
    gfx.ctx.lineTo(dx, dy);
}

function drawMenu() {
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

function drawEnvironment(world) {
    for (var x = 0; x < world.getWidth(); x++) {
        for (var y = 0; y < world.getHeight(); y++) {
            var current_cell = world.getCell(x, y);
            drawSprite(x, y, current_cell.spriteName);
        }
    }
}

function drawUnits(world) {
    var units = world.getUnits();
    for (var i in units) {
        var position = assets.spriteManager.getSprite(units[i].spriteName).drawPos;
        drawSprite(position.x, position.y, units[i].spriteName);
    }
}

function drawSelector(selector) {
    var position = selector.pos;
    drawSprite(position.x, position.y, selector.spriteName);
}

function drawSprite(x, y, spriteName) {
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

        gfx.ctx.drawImage(img,
                          pos.x, pos.y,
                          sprite.width, sprite.height,
                          cam_pos.cam_x - centered_offset.cam_w,
                          cam_pos.cam_y - centered_offset.cam_h,
                          cam_size.cam_w, cam_size.cam_h);
    }
}

function drawGrid(world) {
    gfx.ctx.strokeStyle = "#000000";
    gfx.ctx.beginPath();
    for (var x = 0; x <= world.getWidth(); x++) {
        var draw_x = camera.transformToCameraSpace(x, 0).cam_x;
        var top = camera.transformToCameraSpace(x, 0).cam_y;
        var bot = camera.transformToCameraSpace(x, world.getHeight()).cam_y;
        drawLine(draw_x, top, draw_x, bot);
    }

    for (var y = 0; y <= world.getHeight(); y++) {
        var draw_y = camera.transformToCameraSpace(0, y).cam_y;
        var left = camera.transformToCameraSpace(0, y).cam_x;
        var right = camera.transformToCameraSpace(world.getWidth(), y).cam_x;
        drawLine(left, draw_y, right, draw_y);
    }
    gfx.ctx.stroke();
}

function render() {
    clearBack();

    renderers[app.currentState]();
}
