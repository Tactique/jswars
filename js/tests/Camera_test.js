module("Camera tests", {
    setup: function() {
        gfx.width = 1000;
        gfx.height = 1000;
    },
    teardown: function() {
        gfx.width = 0;
        gfx.height = 0;
    }
});
test("Camera", function() {
    // is this dangerous? Camera uses closure hidden variables which I'm
    // modifying here
    var camera = new Camera();

    // the camera defaults to a zoomlevel of 100. In a window of 1000x1000 pixels
    // the "world" would be rendered as 10 100x100 pixel boxes
    var camspace = camera.transformToCameraSpace(4, 4);
    equal(camspace.cam_x, 400);
    equal(camspace.cam_y, 400);

    var worldspace = camera.transformToWorldSpace(400, 400);
    equal(worldspace.world_x, 4);
    equal(worldspace.world_y, 4);

    // Moving the camera right/down by 100 pixels in the x and y should
    // effectively shift everything by one zoom level
    camera.processMove({x: 100, y: 100});
    var camspace = camera.transformToCameraSpace(4, 4);
    equal(camspace.cam_x, 300);
    equal(camspace.cam_y, 300);

    var worldspace = camera.transformToWorldSpace(300, 300);
    equal(worldspace.world_x, 4);
    equal(worldspace.world_y, 4);

    // with the camera shifted, the most upper left cell should not be visible
    camera.processMove({x: 1, y: 1});
    camspace = camera.transformToCameraSpace(0, 0);
    equal(camera.positionVisible(camspace.cam_x, camspace.cam_y), false);
    // patently absurd
    equal(camera.positionVisible(10000000, 10000000), false);
    // obviously visible in a viewport of 1000x1000
    equal(camera.positionVisible(500, 500), true);

    // should probably put tests with zoom changing here
});
