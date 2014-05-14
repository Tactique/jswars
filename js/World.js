// This will eventually have much more information, including movement costs and such
function Cell(spriteName, type, x, y) {
    this.position = {x: x, y: y};
    this.spriteName = spriteName;
    this.type = type;
}

// Units may deserve their own file eventually, as they will have to track
// attack and defense information for the various weapon types
function Unit(id, player, spriteName, pos, distance, movementType, movement,
              health, maxHealth, nation, name, canMove, attacks, armor) {
    this.id = id;
    this.player = player;
    this.spriteName = spriteName;
    this.pos = pos;
    // The total distance the unit can move
    this.distance = distance;
    // treads, feet, wheels, that sort of thing
    this.movementType = movementType;
    // map of cell types to movement costs, ie plains -> 1.0
    this.movement = movement;
    this.health = health;
    this.maxHealth = maxHealth;
    this.nation = nation;
    this.name = name;
    this.canMove = canMove;
    this.attacks = attacks;
    this.armor = armor;

    this.resetState = function() {
        this.canMove = true;
    }
}

function Player(id, nation, team) {
    this.id = id;
    this.nation = nation;
    this.team = team;
}

var myPlayer;

function addWizard(player, pos) {
    var mtype = "feet";
    var movement = {
        0: 1.0, // Plains
    };
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

    function setCell(x, y, cell) {
        cells[x][y] = cell;
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

    function addOrUpdatePlayer(id, nation, team) {
        var player = new Player(id, nation, team);
        players[id] = player;
        if (id === playerId) {
            myPlayer = player;
        }
    }

    function getPlayer(id) {
        return players[id];
    }

    function getPlayerFromNation(nation) {
        for (var id in players) {
            if (players[id].nation === nation) {
                return players[id];
            }
        }
        return null;
    }

    // unit sprite's have to be cloned, so we have to wrap their creation
    function addUnit(uid, player, srcSpriteName, pos, distance, movementType,
                     movement, health, maxHealth, nation, name, canMove,
                     attacks, armor) {
        var newSpriteName = player + srcSpriteName + unitCounter;
        unitCounter += 1;
        var spritePos = jQuery.extend(true, {}, pos);
        assets.spriteManager.cloneSprite(srcSpriteName, newSpriteName, spritePos);
        var newUnit = new Unit(uid, player, newSpriteName, pos, distance,
                               movementType, movement, health, maxHealth,
                               nation, name, canMove, attacks, armor);
        units[uid] = newUnit;
    }

    function moveUnit(srcPos, destPos) {
        var unit = findUnit(srcPos.x, srcPos.y);
        if (!unit) {
            console.log("No unit found at", srcPos);
            return;
        }
        if (findUnit(destPos.x, destPos.y) !== undefined) {
            console.log("A unit exists at", destPos, "already");
            return;
        }
        unit.pos = destPos;
    }

    function getUnits() {
        var output = [];
        for (var id in units) {
            output.push(units[id]);
        }
        return output;
    }

    function findUnit(wx, wy) {
        for (var id in units) {
            if (units[id].pos.x === wx && units[id].pos.y === wy) {
                return units[id];
            }
        }
        return undefined;
    }

    function getUnit(id) {
        return units[id];
    }

    function resetUnits(playerId) {
        var playerNation = getPlayer(playerId).nation;
        var allUnits = getUnits();
        for (var i = allUnits.length - 1; i >= 0; i--) {
            if (allUnits[i].nation === playerNation) {
                allUnits[i].resetState();
            }
        };
    }

    function findAvailableMoves(unit) {
        if (unit.canMove) {
            var moves = findAvailableCells(unit);
            game.movesAvailableCallback(moves);
            return moves;
        } else {
            console.log("That unit moved already");
        }
    }

    function findAvailableAttacks(unit) {
        // need to go through a different process for melee/range units
        // ranged units need to get their attack range from somewhere, min and max
        var moves = findAvailableCells(unit);
        var attacks = processMeleeAttack(unit, moves);
        game.attacksAvailableCallback(attacks);
        return attacks;
    }

    function findAvailableCells(unit) {
        function cellEqual(cell1, cell2) {
            return cell1.cell.position.x == cell2.cell.position.x &&
                   cell1.cell.position.y == cell2.cell.position.y;
        }

        var visited = new BinaryHeap(function() { return 1; }, cellEqual);
        var source = cells[unit.pos.x][unit.pos.y];

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
                        if (moveCost > 0 && neighborUnit === undefined &&
                            remainingmoves - moveCost > 0) {
                            processCell(neighbors[i], remainingmoves - moveCost);
                        }
                    }
                }
            }
        }

        processCell(source, unit.distance);

        var moves = new BinaryHeap(function() { return 1; }, cellEqual);
        for (var i = visited.content.length - 1; i >= 0; i--) {
            if (!moves.contains(visited.content[i])) {
                moves.push(visited.content[i]);
            }
        }

        return moves.content;
    }

    // Rule is the shape of the neighbors you want. "plus" means just
    // the above, below, left, and right neighbors. "square" means
    // the full 3x3 grid of neighbors
    function getNeighbors(wx, wy, rule) {
        function initializeNeighbors(size) {
            var neighbors = new Array(size);
            for (var i = 0; i < size; i++) {
                neighbors[i] = new Array(size);
            }
            return neighbors;
        }

        rule = rule === undefined ? "plus" : rule;
        var neighbors = initializeNeighbors(3);
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if (withinWorld(wx + x, wy + y)) {
                    neighbors[x + 1][y + 1] = cells[wx + x][wy + y];
                }
            }
        }
        if (rule === "plus") {
            set2DCorners(neighbors, 3, {});
        }
        objectifyUndefined(neighbors);

        return neighbors;
    }

    function processRangeAttack(unit, moves) {
        // TODO this is all wrong
        var attacks = [];
        for (var i = moves.length - 1; i >= 0; i--) {
            if (ManhattanDistance(moves[i].cell.position, unit.pos) >= unit.minRange) {
                attacks.push(moves[i]);
            }
        }

        return attacks;
    }

    function processMeleeAttack(unit, moves) {
        // sorry!
        function cellEqual(cell1, cell2) {
            return cell1.cell.position.x == cell2.cell.position.x &&
                   cell1.cell.position.y == cell2.cell.position.y;
        }

        var attacks = new BinaryHeap(function() { return 1; }, cellEqual);
        for (var i = moves.length - 1; i >= 0; i--) {
            var neighbors = getMatrixNeighbors(cells, moves[i].cell.position);
            for (var j = neighbors.length - 1; j >= 0; j--) {
                var neighbor = {cell: neighbors[j]};
                if (!attacks.contains(neighbor)) {
                    attacks.push(neighbor);
                }
            }
        }

        return attacks.content;
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
                    unit.loc = unit.pos;
                    delete unit.pos;
                    outUnits[player].push(unit);
                }
            }
        }

        return outUnits;
    }

    var w = width;
    var h = height;

    var cells = new Array(width);

    var players = {};
    var unitCounter = 0;
    var units = {};

    for (var x = 0; x < width; x++) {
        cells[x] = new Array(height);
    }

    this.getWidth = function() {
        return getWidth();
    };

    this.getHeight = function() {
        return getHeight();
    };

    this.getCell = function(x, y) {
        return getCell(x, y);
    };

    this.setCell = function(x, y, cell) {
        setCell(x, y, cell);
    };

    this.initialize = function(entryCells) {
        initialize(entryCells);
    };

    this.addUnit = function(uid, player, srcSpriteName, pos, distance, movementType,
                            movement, health, maxHealth, nation, name, canMove,
                            attacks, armor) {
        addUnit(uid, player, srcSpriteName, pos, distance, movementType, movement,
                health, maxHealth, nation, name, canMove, attacks, armor);
    };

    this.getUnits = function() {
        return getUnits();
    };

    this.findUnit = function(wx, wy) {
        return findUnit(wx, wy);
    };

    this.getUnit = function(id) {
        return getUnit(id);
    };

    this.withinWorld = function(x, y) {
        return withinWorld(x, y);
    };

    this.findAvailableMoves = function(unit) {
        return findAvailableMoves(unit);
    };

    this.findAvailableAttacks = function(unit) {
        return findAvailableAttacks(unit);
    };

    this.serialize = function() {
        return serialize();
    };

    this.moveUnit = function(srcPos, destPos) {
        moveUnit(srcPos, destPos);
    }

    this.resetUnits = function(playerId) {
        resetUnits(playerId);
    }

    this.addOrUpdatePlayer = function(id, nation, team) {
        addOrUpdatePlayer(id, nation, team);
    }

    this.getPlayer = function(id) {
        return getPlayer(id);
    }

    this.getPlayerFromNation = function(nation) {
        return getPlayerFromNation(nation);
    }

    this.getNeighbors = function(wx, wy, rule) {
        return getNeighbors(wx, wy, rule);
    }

    this.currentPlayerId = null;
}

function plainsWorld(width, height) {
    var terrain = new Array(width);

    for (var x = 0; x < width; x++) {
        terrain[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            terrain[x][y] = terrainTable[terrainTypes.plains](x, y);
        }
    }

    var w = new World(width, height);
    w.initialize(terrain);

    return w;
}

function routePath(unit, goal) {
    var moves = game.world.findAvailableMoves(unit);
    var pathworld = convertWorldToPathNodes(game.world, unit, moves);
    var pathfinder = new PathFinder(pathworld, pathworld[unit.pos.x][unit.pos.y]);
    var path = pathfinder.findPath(pathworld[goal.x][goal.y]);
    if (path) {
        game.pathCallback(path);
    } else {
        console.log("You can't get there!");
    }
    return path;
}

var terrainTable;
var terrainTypes = {};

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
