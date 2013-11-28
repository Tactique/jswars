(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function _load(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onerror = function() {
                console.log("Failed to load image from " + url);
            }
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    assets = { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady,
        sprites: new SpriteManager()
    };
})();

function GatherAssets(readyFunc) {
    assets.onReady(readyFunc)
    assets.load(['assets/unit_sprites.png', 'assets/env_sprites.png']);
}
