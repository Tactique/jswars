function initRenderers() {
    game.selectorCallback = handleSelectorRendering;

    game.pathCallback = handlePathRendering;

    game.movesAvailableCallback = handleMovesRendering;

    game.attacksAvailableCallback = handleAttacksRendering;
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
        if (i === 0) {
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
