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
    // for now, my heap is a min heap, so -1 * score is the easiest way to
    // flip it
    return -1 * pathNode.totalCost();
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
            this.updateOpenList(current, goal, openlist, closedlist);
            current = openlist.pop();
        }
    }

    this.updateOpenList = function(current, goal, open, closed) {
        var leftN = this.world[current.position.x - 1][current.position.y];
        this.processNeighbor(current, leftN, goal, open, closed);

        var rightN = this.world[current.position.x + 1][current.position.y];
        this.processNeighbor(current, rightN, goal, open, closed);

        var upN = this.world[current.position.x][current.position.y - 1];
        this.processNeighbor(current, upN, goal, open, closed);

        var downN = this.world[current.position.x][current.position.y + 1];
        this.processNeighbor(current, downN, goal, open, closed);
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
            if (neighbor.passable && !closedlist.contains(neighbor)) {
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

    this.atGoal = function(current, goal) {
        return (current.position.x == goal.position.x &&
                current.position.y == goal.position.y);
    }
    
    // world is a 2d array of pathNodes
    this.world = world;
    this.start = start;
    this.movementCostFunc = this.GCost;
    this.heuristicCostFunc = this.ManhattanDistance;
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
