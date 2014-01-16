// pathNodes store the costs during the route calculation, with parents
function pathNode(position, costModifier, passable) {
    this.position = position;
    this.costModifier = costModifier;
    this.passable = passable;
    this.Gcost = 0;
    this.Hcost = 0;
    this.pathparent = null;

    this.totalCost = function() {
        return this.Gcost + this.Hcost;
    }
}

function pathNodeScore(node) {
    return node.totalCost();
}

function pathNodeEqual(n1, n2) {
    return (n1.position.x == n2.position.x &&
            n1.position.y == n2.position.y &&
            n1.Gcost == n2.Gcost && n1.Hcost == n2.Hcost);
}

function PathFinder(world, start) {
    this.GCost = function(current, neighbor) {
        // I don't really want to do the square root
        var xsq = (current.position.x - neighbor.position.x) * 
                  (current.position.x - neighbor.position.x);
        var ysq = (current.position.y - neighbor.position.y) * 
                  (current.position.y - neighbor.position.y);
        return Math.sqrt(xsq + ysq) * neighbor.costModifier + current.Gcost;
    }

    // current and goal are pathNodes
    this.ManhattanDistance = function(current, goal) {
        return (Math.abs(goal.position.x - current.position.x) +
                Math.abs(goal.position.y - current.position.y));
    }

    this.findPath = function(goal) {    
        // the openlist is pathNodes
        var openlist = new BinaryHeap(pathNodeScore, pathNodeEqual);
        // The closedlist does not need to be a heap, but I'm lazy
        var closedlist = new BinaryHeap(pathNodeScore, pathNodeEqual);
        var current = this.start;

        while (!this.atGoal(current, goal)) {
            console.log(current);
            this.updateOpenList(current, goal, openlist, closedlist);
            closedlist.push(current);
            current = openlist.pop();
            if (openlist.size() > 50) {
                break;
            }
        }
        console.log("Found path, retracing steps");
        var path = [];
        while (!this.atGoal(current, this.start)) {
            path.push(current);
            current = current.pathparent;
        }
        path.push(current);
        console.log("Path:", path);

        return path;
    }

    this.updateOpenList = function(current, goal, open, closed) {
        var neighbors = this.getNeighbors(current);
        for (var i in neighbors) {
            this.processNeighbor(current, neighbors[i], goal, open, closed);
        }
    }

    this.processNeighbor = function(current, neighbor, goal, open, closed) {
        if (open.contains(neighbor)) {
        // Recalculate G cost and update parentage if necessary
            var g = this.GCost(current, neighbor);
            if (g < neighbor.Gcost) {
                neighbor.Gcost = g;
                neighbor.pathparent = current;
            }
        } else {
            if (neighbor.passable && !closed.contains(neighbor)) {
                // calculate the F = G + H cost of the neighbor
                var g = this.movementCostFunc(current, neighbor);
                var h = this.heuristicCostFunc(current, goal);
                neighbor.pathparent = current;
                neighbor.Gcost = g;
                neighbor.Hcost = h;
                // add the neighbor to the open list
                open.push(neighbor);
            }
        }
    }

    this.getNeighbors = function(current) {
        console.log(current);
        var neighbors = [];
        var curpos = current.position;
        var leftpos = {x: curpos.x - 1, y: curpos.y};
        if (this.withinWorld(leftpos)) {
            neighbors.push(this.world[leftpos.x][leftpos.y]);
        }

        var rightpos = {x: curpos.x + 1, y: curpos.y};
        if (this.withinWorld(rightpos)) {
            neighbors.push(this.world[rightpos.x][rightpos.y]);
        }

        var uppos = {x: curpos.x, y: curpos.y - 1};
        if (this.withinWorld(uppos)) {
            neighbors.push(this.world[uppos.x][uppos.y]);
        }

        var downpos = {x: curpos.x, y: curpos.y + 1};
        if (this.withinWorld(downpos)) {
            neighbors.push(this.world[downpos.x][downpos.y]);
        }
        return neighbors;
    }

    this.withinWorld = function(position) {
        return position.x >= 0 && position.x < this.world.length &&
               position.y >= 0 && position.y < this.world[0].length;
    }

    this.defaultGoal = function(current, goal) {
        return (current.position.x == goal.position.x &&
                current.position.y == goal.position.y);
    }

    // world is a 2d array of pathNodes
    this.world = world;
    this.start = start;
    this.movementCostFunc = this.GCost;
    this.heuristicCostFunc = this.ManhattanDistance;
    this.atGoal = this.defaultGoal;
}

var pathworld;
var pf;
function testpath() {
    var width = 5;
    var height = 5;
    pathworld = new Array(width);
    for (var x = 0; x < width; x++) {
        pathworld[x] = new Array(height);
    }
    for (var y = 0; y < height; y++){
        for (var x = 0; x < width; x++) {
            pathworld[x][y] = new pathNode({x: x, y: y}, 1.0, true);
        }
    }
    pf = new PathFinder(pathworld, pathworld[0][0]);
}
