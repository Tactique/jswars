function initRenderers(width, height, destination) {
    game.selectorCallback = handleSelectorRendering;

    game.pathCallback = handlePathRendering;

    game.movesAvailableCallback = handleMovesRendering;

    game.attacksAvailableCallback = handleAttacksRendering;

    renderers["CAMERA_CONTROL"] = new Renderer(width, height, destination);
    renderers["UNIT_CONTROL"] = new Renderer(width, height, destination);
    // This renderer won't do anything for now
    renderers["MENU_CONTROL"] = new Renderer(width, height, destination);
    renderers["CELL_PLACEMENT"] = new Renderer(width, height, destination);

    setupWorldRenderLayers(renderers["CAMERA_CONTROL"]);
    setupWorldRenderLayers(renderers["UNIT_CONTROL"]);
    setupWorldRenderLayers(renderers["CELL_PLACEMENT"]);

    resizeCanvas(width, height);
}

function setupWorldRenderLayers(renderer) {
    console.log("Setting up a renderer", renderer);
    // drawEnvironment is a background
    renderer.registerBackgroundLayerTask("drawEnvironment", drawEnvironment);
    // drawUnits is a sprite
    renderer.registerSpriteLayerTask("drawUnits", drawUnits);
    // drawGrid is a foreground
    renderer.registerForegroundLayerTask("drawGrid", drawGrid);
}

function handlePathRendering(path) {
    activeRenderer.removeForegroundLayerTask("path");
    activeRenderer.registerForegroundLayerTask("path", drawPath.bind(null, path));
}

function handleMovesRendering(moves) {
    activeRenderer.removeForegroundLayerTask("moves");
    activeRenderer.registerForegroundLayerTask("moves", drawMoves.bind(null, moves));
}

function handleAttacksRendering(attacks) {
    activeRenderer.removeForegroundLayerTask("attacks");
    activeRenderer.registerForegroundLayerTask("attacks", drawAttacks.bind(null, attacks));
}

// for now these functions need to take the context as the second argument, since
// they're pre-bound, but that could change if I add functions to the Renderers
// that deal with bound renderable objects
function drawPath(path, ctx) {
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
        if (i === 0) {
            // start path sprite
            ctx.fillStyle = "#FF0000";
        } else if (i == path.length - 1) {
            // end path sprite
            ctx.fillStyle = "#00FF00";
        } else {
            var turn1 = determineTurn(path[i - 1], path[i], path[i + 1]);
            var turn2 = determineTurn(path[i + 1], path[i], path[i - 1]);
            var turn = turn1 || turn2;
            switch(turn) {
                case turnTable.HORIZ:
                    ctx.fillStyle = "#F0F000";
                    break;
                case turnTable.VERT:
                    ctx.fillStyle = "#FFFFFF";
                    break;
                case turnTable.LEFTUP:
                    ctx.fillStyle = "#0F0F00";
                    break;
                case turnTable.RIGHTUP:
                    ctx.fillStyle = "#0F00F0";
                    break;
                case turnTable.LEFTDOWN:
                    ctx.fillStyle = "#0F000F";
                    break;
                case turnTable.RIGHTDOWN:
                    ctx.fillStyle = "#0F0FF0";
                    break;
            }
        }
        var pos = camera.transformToCameraSpace(path[i].position.x, path[i].position.y);
        ctx.fillRect(pos.cam_x + 25, pos.cam_y + 25, 50, 50);
    }
}

function drawMoves(moves, ctx) {
    for (var i in moves) {
        drawSprite(ctx, moves[i].cell.position.x, moves[i].cell.position.y, "move");
    }
}

function drawAttacks(attacks, ctx) {
    for (var i in attacks) {
        drawSprite(ctx, attacks[i].cell.position.x, attacks[i].cell.position.y, "attack");
    }
}
