var terrainTypes = Object.freeze({Plains: "Plains"});

// This will eventually have much more information, including movement costs and such
function Cell(spriteName, type) {
    this.spriteName = spriteName;
    this.type = type;
}

// Units may deserve their own file eventually, as they will have to track
// attack and defense information for the various weapon types
function Unit(spriteName, pos, distance, movementType, speeds) {
    this.spriteName = spriteName;
    this.pos = pos;
    // The total distance the unit can move
    this.distance = distance;
    // treads, feet, wheels, that sort of thing
    this.movementType = movementType;
    // map of cell types to movement costs, ie plains -> 1.0
    this.speeds = speeds;
}

function addWizard(player, pos) {
    var mtype = "feet";
    var speed = {
        "Plains": 1.0,
    }
    var distance = 4;
    game.world.addUnit(player, "wizard", pos, distance, mtype, speed);
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
                    cells[x][y] = entryCells[y][x];
                }
            }
        } else {
            console.log("World.initialize called with incorrect size");
        }
    }

    // unit sprite's have to be cloned, so we have to wrap their creation
    function addUnit(player, srcSpriteName, pos, distance, movementType, speeds) {
        if (units[player] == null) {
            units[player] = [];
        }
        var newSpriteName = player + srcSpriteName + units[player].length;
        assets.spriteManager.cloneSprite(srcSpriteName, newSpriteName);
        var newUnit = new Unit(newSpriteName, pos, distance, movementType, speeds);
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
        for (var i in units) {
            if (units[i].pos.x == wx && units[i].pos.y == wy) {
                return units[i];
            }
        }
        return null;
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

    this.addUnit = function(player, srcSpriteName, pos, distance, movementType, speeds) {
        addUnit(player, srcSpriteName, pos, distance, movementType, speeds);
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
}

function testPath(start, end) {
    var pathworld = convertWorldToPathNodes(game.world);
    var pathfinder = new PathFinder(pathworld, pathworld[start.x][start.y]);
    var path = pathfinder.findPath(pathworld[end.x][end.y]);
    game.pathCallback(path);
}

function Plains() {
    return new Cell("plains", terrainTypes.Plains);
}

var terrainTable = [
    Plains,
]

function terrainLookup(id) {
    // TODO This data should come from some JSON source on the server
    return new terrainTable[id];
}

function convertWorldToPathNodes(world, unit) {
    var pathworld = new Array(world.getWidth());
    for (var x = 0; x < world.getWidth(); x++) {
        pathworld[x] = new Array(world.getHeight());
        for (var y = 0; y < world.getHeight(); y++) {
            // The cost modifier could/should come from a combination of
            // the cell type and the unit's movement modifiers. Likewise for
            // passable
            pathworld[x][y] = new pathNode({x: x, y: y}, 1, true);
        }
    }
    return pathworld;
}
