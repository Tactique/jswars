var renderers = {
    "CAMERA_CONTROL": drawWorld,
    "UNIT_CONTROL": drawWorld,
    "MENU_CONTROL" : drawMenu
}

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

var specialRenderer;
function SpecialRenderer() {
    function addLayer(key, priority, renderfunc, renderable) {
        renderer = {
            key: key,
            priority: priority,
            rfunc: renderfunc.bind(null, renderable)
        }
        renderers.push(renderer);
    }

    function removeLayer(key) {
        // renderers are wrapped in objects which contain a key, so an
        // object needs to be created and passed here to delete
        renderers.remove({key: key})
    }

    function render() {
        for (var i = renderers.content.length - 1; i >= 0 ; i--) {
            renderers.content[i].rfunc();
        };
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
    }

    this.removeLayer = function(key) {
        removeLayer(key);
    }

    this.render = function() {
        render();
    }
}

function initRenderers() {
    specialRenderer = new SpecialRenderer();

    game.selectorCallback = handleSelectorRendering;

    game.pathCallback = handlePathRendering;

    game.movesAvailableCallback = handleMovesRendering;

    game.attacksAvailableCallback = handleAttacksRendering;
}

function handleSelectorRendering(selector) {
    specialRenderer.removeLayer("selector");
    sprites.selector.animate = true;
    specialRenderer.addLayer("selector", 1, drawSelector, selector);
}

function handlePathRendering(path) {
    specialRenderer.removeLayer("path");
    specialRenderer.addLayer("path", 2, drawPath, path);
}

function handleMovesRendering(moves) {
    specialRenderer.removeLayer("moves");
    specialRenderer.addLayer("moves", 3, drawMoves, moves);
}

function handleAttacksRendering(attacks) {
    specialRenderer.removeLayer("attacks");
    specialRenderer.addLayer("attacks", 3, drawAttacks, attacks);
}

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

function drawWorld() {
    drawEnvironment(game.world);

    drawUnits(game.world);

    drawGrid(game.world);

    specialRenderer.render();
}

function drawPath(path) {
    var turnTable = Object.freeze({
        LEFTUP: "LEFTUP", RIGHTUP: "RIGHTUP",
        LEFTDOWN: "LEFTDOWN", RIGHTDOWN: "RIGHTDOWN",
		HORIZ: "HORIZ", VERT: "VERT"
    });

    function determineTurn(before, current, after) {
		//  b - c - a
		if (before.position.x + 1 == current.position.x &&
            before.position.y == current.position.y &&
			current.position.x + 1 == after.position.x &&
			current.position.y == after.position.y)
		{
			return turnTable.HORIZ;
		}
		//      b
		//      |
		//      c
		//      |
		//      a
		if (before.position.x == current.position.x &&
            before.position.y + 1 == current.position.y &&
			current.position.x == after.position.x &&
			current.position.y + 1 == after.position.y)
		{
			return turnTable.VERT;
		}
        //      a
        //      |
        //  b - c
        if (before.position.x + 1 == current.position.x &&
            before.position.y == current.position.y &&
            current.position.x == after.position.x &&
            current.position.y - 1 == after.position.y)
        {
            return turnTable.LEFTUP;
        }
        //      b
        //      |
        //      c - a
        if (before.position.x == current.position.x &&
            before.position.y + 1 == current.position.y &&
            current.position.x + 1 == after.position.x &&
            current.position.y == after.position.y)
        {
            return turnTable.RIGHTUP;
        }
        //  b - c
        //      |
        //      a
        if (before.position.x + 1 == current.position.x &&
            before.position.y == current.position.y &&
            current.position.x == after.position.x &&
            current.position.y + 1 == after.position.y)
        {
            return turnTable.LEFTDOWN;
        }
        //      c - a
        //      |
        //      b
        if (before.position.x == current.position.x &&
            before.position.y - 1 == current.position.y &&
            current.position.x + 1 == after.position.x &&
            current.position.y == after.position.y)
        {
            return turnTable.RIGHTDOWN;
        }
    }

    for (var i = 0; i < path.length; i++) {
        if (i == 0) {
            // start path sprite
            gfx.ctx.fillStyle = "#FF0000";
        } else if (i == path.length - 1) {
            // end path sprite
            gfx.ctx.fillStyle = "#00FF00";
        } else {
            var turn1 = determineTurn(path[i - 1], path[i], path[i + 1]);
            var turn2 = determineTurn(path[i + 1], path[i], path[i - 1]);
            var turn = turn1 || turn2;
            switch(turn) {
			    case turnTable.HORIZ:
                    gfx.ctx.fillStyle = "#F0F000";
                    break;
                case turnTable.VERT:
                    gfx.ctx.fillStyle = "#FFFFFF";
                    break;
                case turnTable.LEFTUP:
                    gfx.ctx.fillStyle = "#0F0F00";
                    break;
                case turnTable.RIGHTUP:
                    gfx.ctx.fillStyle = "#0F00F0";
                    break;
                case turnTable.LEFTDOWN:
                    gfx.ctx.fillStyle = "#0F000F";
                    break;
                case turnTable.RIGHTDOWN:
                    gfx.ctx.fillStyle = "#0F0FF0";
                    break;
            }
        }
        var pos = camera.transformToCameraSpace(path[i].position.x, path[i].position.y);
        gfx.ctx.fillRect(pos.cam_x + 25, pos.cam_y + 25, 50, 50);
    }
}

function drawMoves(moves) {
    for (var i in moves) {
        drawSprite(moves[i].cell.position.x, moves[i].cell.position.y, "move");
    }
}

function drawAttacks(attacks) {
    for (var i in attacks) {
        drawSprite(attacks[i].cell.position.x, attacks[i].cell.position.y, "attack");
    }
}

function drawEnvironment(world) {
    for (var x = 0; x < world.getWidth(); x++) {
        for (var y = 0; y < world.getHeight(); y++) {
            var current_cell = world.getCell(x, y);
            drawSprite(x, y, current_cell.spriteName)
        }
    }
}

function drawUnits(world) {
    var units = world.getUnits();
    for (var i in units) {
        var position = units[i].pos;
        drawSprite(position['x'], position['y'], units[i].spriteName);
    }
}

function drawSelector(selector) {
    var position = selector.pos;
    drawSprite(position['x'], position['y'], selector.spriteName);
}

function drawSprite(x, y, spriteName) {
    var cam_pos = camera.transformToCameraSpace(x, y);
    if (camera.positionVisible(cam_pos.cam_x, cam_pos.cam_y)) {
        var sprite = assets.spriteManager.getSprite(spriteName)
        var img = assets.get(sprite.url);
        var pos = sprite.getFramePosition();

        var rel_width = sprite.width / assets.spriteManager.minWidth;
        var rel_height = sprite.height / assets.spriteManager.minHeight;
        var cam_size = camera.multZoomFactor(rel_width, rel_height);
        var centered_offset = camera.multZoomFactor(rel_width - 1.0,
                                                    rel_height - 1.0);
        centered_offset.cam_w = centered_offset.cam_w / 2;
        centered_offset.cam_h = centered_offset.cam_h / 2;

        gfx.ctx.drawImage(img,
                          pos['x'], pos['y'],
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

    renderers[game.currentState]()
}
