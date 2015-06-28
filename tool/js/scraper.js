function objEach(obj, cb, thisArg) {
  if(typeof thisArg !== 'undefined') {
    cb = cb.bind(thisArg);
  }

  var count = 0;
  var keys = Object.keys(obj);
  var length = keys.length;

  for(; count < length; count++) {
    var key = keys[count];
    cb(obj[key], key, obj);
  }
}

var map = {
  libraries: {}
};

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

init.libraries.forEach(function(elm) {
  var library = {
    names: {}
  };

  var length = elm.length;
  elm.forEach(function(elm, index) {
    if(index == 0) {
      library.name = elm;
    }

    if(index === length - 1) {
      var alphadex = 25;
      while(--alphadex >= 0) {
        if(eval("typeof(" + alphabet[alphadex] + ")") === "object" && eval(alphabet[alphadex]) === elm)
          library.obj = alphabet[alphadex];
      }
    }

    if(Array.isArray(elm)) {
      elm.forEach(function(name) {
        if(init.allClasses[name] && init.mangledGlobalNames[name]) {
          library.names[init.mangledGlobalNames[name]] = {
            name: name,
            fields: init.allClasses[name]['$__fields__']
          };
        } else if(init.mangledGlobalNames[name] && init.mangledGlobalNames[name].indexOf('new ') === 0) {
          library.names[init.mangledGlobalNames[name].split(':')[0]] = {
            name: name
          };
        }
      });
    }
  });

  map.libraries[library.name] = library;
});

console.log(JSON.stringify(map));
