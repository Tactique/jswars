var terrainTypes = Object.freeze({Plains: 0});

// This will eventually have much more information, including movement costs and such
function Cell(x, y, spriteName, type) {
    this.position = {x: x, y: y};
    this.spriteName = spriteName;
    this.type = type;
}

// Units may deserve their own file eventually, as they will have to track
// attack and defense information for the various weapon types
function Unit(spriteName, pos, distance, movementType, movement,
              health, team, name) {
    this.spriteName = spriteName;
    this.pos = pos;
    // The total distance the unit can move
    this.distance = distance;
    // treads, feet, wheels, that sort of thing
    this.movementType = movementType;
    // map of cell types to movement costs, ie plains -> 1.0
    this.movement = movement;
    this.health = health;
    this.team = team;
    this.name = name;
}

function addWizard(player, pos) {
    var mtype = "feet";
    var movement = {
        0: 1.0, // Plains
    }
    var distance = 4;
    game.world.addUnit(player, "wizard", pos, distance, mtype, movement);
}

function World(width, height) {

    function getWidth() {
        return w;
    }

    function getHeight() {
        return h;
    }

    function getCell(x, y) {
        return cells[x][y];
    }

    function withinWorld(x, y) {
        return x >= 0 && x < w && y >= 0 && y < h;
    }

    function initialize(entryCells) {
        if (entryCells.length == w && entryCells[0].length == h)
        {
            for (var x = 0; x < w; x++) {
                for (var y = 0; y < h; y++) {
                    cells[x][y] = entryCells[x][y];
                }
            }
        } else {
            console.log("World.initialize called with incorrect size");
        }
    }

    // unit sprite's have to be cloned, so we have to wrap their creation
    function addUnit(player, srcSpriteName, pos, distance, movementType,
                     movement, health, team, name) {
        if (units[player] == null) {
            units[player] = [];
        }
        var newSpriteName = player + srcSpriteName + units[player].length;
        assets.spriteManager.cloneSprite(srcSpriteName, newSpriteName);
        var newUnit = new Unit(newSpriteName, pos, distance, movementType, movement);
        units[player].push(newUnit);
    }

    // If player is null, this will return all units as a list
    function getUnits(player) {
        var output = [];
        for (var key in units) {
            if (units.hasOwnProperty(key)) {
                if (player == null || key == player) {
                    for (var i in units[key]) {
                        output.push(units[key][i]);
                    }
                }
            }
        }
        return output;
    }

    function findUnit(wx, wy) {
        var units = getUnits();
        for (var i = units.length - 1; i >= 0; i--) {
            if (units[i].pos.x == wx && units[i].pos.y == wy) {
                return units[i];
            }
        }
        return null;
    }

    function findAvailableMoves(unit) {
        function cellEqual(cell1, cell2) {
            return cell1.cell.position.x == cell2.cell.position.x &&
                   cell1.cell.position.y == cell2.cell.position.y;
        }

        var visited = new BinaryHeap(function() { return 1; }, cellEqual);

        function processCell(cell, remainingmoves) {
            visited.push({cell: cell, remainingmoves: remainingmoves});
            if (remainingmoves > 0) {
                var neighbors = getMatrixNeighbors(cells, cell.position);
                for (var i = neighbors.length - 1; i >= 0; i--) {
                    var neighbor = {cell: neighbors[i],
                                    remainingmoves: neighbors[i].remainingmoves};
                    var neighborUnit = game.world.findUnit(neighbors[i].position.x,
                                                           neighbors[i].position.y);
                    if (visited.contains(neighbor)) {
                        neighbor.remainingmoves = visited.get(neighbor).remainingmoves;
                    } else {
                        neighbor.remainingmoves = 0;
                    }
                    if (!visited.contains(neighbor) ||
                        remainingmoves > neighbor.remainingmoves) {
                        var moveCost = unit.movement[neighbor.cell.type];
                        if (moveCost > 0 && neighborUnit == null) {
                            processCell(neighbors[i], remainingmoves - moveCost);
                        }
                    }
                }
            }
        }

        processCell(cells[unit.pos.x][unit.pos.y], unit.distance);

        var moves = new BinaryHeap(function() { return 1; }, cellEqual);
        for (var i = visited.content.length - 1; i >= 0; i--) {
            if (!moves.contains(visited.content[i])) {
                moves.push(visited.content[i]);
            }
        };

        game.movesAvailableCallback(moves.content);
        return moves.content;
    }

    function serialize() {
        var outUnits = serializeUnits();
        var terrain = serializeTerrain();

        var serialObject = {"units": outUnits,
                            "terrain": terrain};

        return JSON.stringify(serialObject);
    }

    function serializeTerrain() {
        var terrain = new Array(w);
        for (var x = 0; x < w; x++) {
            terrain[x] = new Array(h);
            for (var y = 0; y < h; y++) {
                terrain[x][y] = cells[x][y].type;
            }
        }

        return terrain;
    }

    function serializeUnits() {
        var outUnits = {};
        for (var player in units) {
            if (units.hasOwnProperty(player)) {
                outUnits[player] = [];
                for (var i = 0; i < units[player].length; i++) {
                    var unit = jQuery.extend(true, {}, units[player][i]);
                    unit["loc"] = unit.pos;
                    delete unit["pos"];
                    outUnits[player].push(unit);
                }
            }
        }

        return outUnits;
    }

    var w = width;
    var h = height;

    var cells = new Array(width);

    var units = {};

    for (var x = 0; x < width; x++) {
        cells[x] = new Array(height);
    }

    this.getWidth = function() {
        return getWidth();
    }

    this.getHeight = function() {
        return getHeight();
    }

    this.getCell = function(x, y) {
        return getCell(x, y);
    }

    this.initialize = function(entryCells) {
        initialize(entryCells);
    }

    this.addUnit = function(player, srcSpriteName, pos, distance, movementType,
                            movement, health, team, name) {
        addUnit(player, srcSpriteName, pos, distance, movementType, movement,
                health, team, name);
    }

    this.getUnits = function(player) {
        return getUnits(player);
    }

    this.findUnit = function(wx, wy) {
        return findUnit(wx, wy);
    }

    this.withinWorld = function(x, y) {
        return withinWorld(x, y);
    }

    this.findAvailableMoves = function(unit) {
        return findAvailableMoves(unit);
    }

    this.serialize = function() {
        return serialize();
    }
}

function routePath(unit, goal) {
    var moves = game.world.findAvailableMoves(unit);
    var pathworld = convertWorldToPathNodes(game.world, unit, moves);
    var pathfinder = new PathFinder(pathworld, pathworld[unit.pos.x][unit.pos.y]);
    var path = pathfinder.findPath(pathworld[goal.x][goal.y]);
    if (path) {
        game.pathCallback(path);
    } else {
        alert("You can't get there!");
    }
    return path;
}

function Plains(x, y) {
    return new Cell(x, y, "plains", terrainTypes.Plains);
}

var terrainTable = [
    Plains,
]

function terrainLookup(id, x, y) {
    // TODO This data should come from some JSON source on the server
    return new terrainTable[id](x, y);
}

function cellEqual(cell1, cell2) {
    return cell1.cell.position.x == cell2.position.x &&
           cell1.cell.position.y == cell2.position.y;
}

function convertWorldToPathNodes(world, unit, moves) {
    var pathworld = new Array(world.getWidth());
    for (var x = 0; x < world.getWidth(); x++) {
        pathworld[x] = new Array(world.getHeight());
        for (var y = 0; y < world.getHeight(); y++) {
            // The cost modifier could/should come from a combination of
            // the cell type and the unit's movement modifiers. Likewise for
            // passable
            var cost = unit.movement[world.getCell(x, y).type];
            var passable = false;
            if (cost > 0 && arrayContains(moves, world.getCell(x, y), cellEqual)) {
                passable = true;
            }
            pathworld[x][y] = new pathNode({x: x, y: y}, cost, passable);
        }
    }
    return pathworld;
}
