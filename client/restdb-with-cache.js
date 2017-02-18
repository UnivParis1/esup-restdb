function restdb_with_cache(restdb, path, opts, onchange) {
    var cacheName = "restdb-" + path;
    var map = {};

    function getCache() {
        var map_string = localStorage.getItem(cacheName);
        if (map_string) {
            map = JSON.parse(map_string);
            return true;
        } else {
            return false;
        }
    }
    
    function onMapChange() {
        var prev = localStorage.getItem(cacheName);
        var map_string = JSON.stringify(map);
        if (prev !== map_string) {
            localStorage.setItem(cacheName, map_string);
            onchange(null, map);
        }
    }

    function getMapAndCache() {
        restdb.get(path, opts, function (err, map_) {
            if (err) {
                onchange(err);
            } else {
                map = map_;
                onMapChange();
            }
        });
    }

    window.addEventListener('storage', function (event) {
        if (event.key !== cacheName) return;
        map = JSON.parse(event.newValue);    
        onchange(null, map);            
    });

    if (getCache()) {
        onchange(null, map);
        // async update in case of outdated cache (modified by another browser)
        getMapAndCache();
    } else {
        getMapAndCache();
    }

    function setValue(k, v) {
        restdb.set(path + "/" + k, v, opts, function (err, succ) {
            if (err) return onchange(err);
            map[k] = v;
            onMapChange();
        });
    }

    return { set: setValue };
}
