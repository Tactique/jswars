(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];
    var completeCallback = [];
    var assets_loaded = 0;

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

    function onCompletion(func) {
        completeCallback.push(func);
    }

    function completed() {
        assets_loaded += 1;
        if (assets_loaded == asset_json.length) {
            completeCallback.forEach(function(func) { func(); });
        }
    }

    assets = { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady,
        onCompletion: onCompletion,
        completed: completed,
        sprites: new SpriteManager()
    };
})();

var asset_img = ['assets/unit_sprites.png', 'assets/env_sprites.png'];
var asset_json = ['assets/unit_sprites.json', 'assets/env_sprites.json'];

function GatherAssets(readyFunc) {
    function loadAssetInfo() {
        for (var i in asset_json) {
            $.ajax({
                url: asset_json[i],
                dataType: 'json',
                complete: ParseAssetInfo,
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error fetching asset: ", errorThrown);
                }
            });
        }
    }

    assets.onCompletion(readyFunc);
    assets.onReady(loadAssetInfo);
    assets.load(asset_img);
}

function ParseAssetInfo(response) {
    var json = response.responseJSON;
    for (var i = 0; i < json.sprites.length; i++) {
        ParseSpriteInfo(json.sprites[i]);
    }

    assets.completed();
}

function ParseSpriteInfo(sprite) {
    assets.sprites.addSprite(sprite.name, sprite.url, sprite.srcPos,
                             sprite.width, sprite.height,
                             sprite.animRate, sprite.animSeq, false);
}
