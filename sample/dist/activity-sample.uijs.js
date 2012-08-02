(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            return require(file, dirname);
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = { exports : {} };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();
});

require.define("/sample/activity-sample.js",function(require,module,exports,__dirname,__filename,process){var uijs = require('uijs');

var box = uijs.box;
var util = uijs.util;
var positioning = uijs.positioning;
var controls = require('..');
var activity = controls.activity;

var html = uijs.html;

var app = box();
app.ondraw = function(ctx) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, this.width, this.height);
}

app.add(activity({
  x: 0,
  y: 0,
  width: 200,
  height: 100,
  lineType: 'dot',
  animating: true,
}));

module.exports = app;});

require.define("/node_modules/uijs/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"./lib/index"}});

require.define("/node_modules/uijs/lib/index.js",function(require,module,exports,__dirname,__filename,process){exports.canvasize = require('./canvasize');
exports.box = require('./box');
exports.html = require('./html');
exports.util = require('./util');
exports.positioning = require('./positioning');
exports.interaction = require('./interaction');
exports.animation = require('./animation');
exports.events = require('./events');
exports.bind = require('./bind');

exports.kinetics = require('./kinetics');
exports.scroller = require('./scroller');});

require.define("/node_modules/uijs/lib/canvasize.js",function(require,module,exports,__dirname,__filename,process){var box = require('./box');
var capture = require('./interaction').capture;
var bind = require('./bind');

module.exports = function(options) {
  options = options || {};

  // we are "DOMfull" if we have a `window` object.
  var domless = (typeof window === 'undefined');

  // by default, start non-paused unless we are domless.
  options.paused = 'paused' in options ? options.paused : domless;

  // by default we do not do auto resize
  options.autoresize = 'autoresize' in options ? options.autoresize : false;

  // shim `window` for DOM-less executions (e.g. node.js)
  if (domless) window = {};

  window.requestAnimationFrame || (
    window.requestAnimationFrame = 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(cb) { setTimeout(cb, 1000/60); }
  );

  window.devicePixelRatio || (window.devicePixelRatio = 1);

  //TODO: Added 4 lines below for debugging - remove when done
  //TODO: please do not submit this hunk uncommented because tests fail
  window.requestAnimationFrame = function(cb) { setTimeout(cb, 1); }
  alert('Original pixel ratio: ' + window.devicePixelRatio);
  window.devicePixelRatio = 2;
  alert('Pixel ratio: ' + window.devicePixelRatio);

  var canvas = null;

  if (options.element) {
    canvas = options.element;
    canvas.width = canvas.width || parseInt(canvas.style.width) * window.devicePixelRatio;
    canvas.height = canvas.height || parseInt(canvas.style.height) * window.devicePixelRatio;
  }
  else {
    if (typeof document === 'undefined') {
      throw new Error('No DOM. Please pass a Canvas object (e.g. node-canvas) explicitly');
    }

    if (document.body.hasChildNodes()) {
      while (document.body.childNodes.length) {
        document.body.removeChild(document.body.firstChild);
      }
    }

    document.body.style.background = 'rgba(0,0,100,0.0)';
    document.body.style.padding = '0px';
    document.body.style.margin = '0px';

    canvas = document.createElement('canvas');
    canvas.style.background = 'rgba(0,0,0,0.0)';
    document.body.appendChild(canvas);

    var bufferCanvas = document.createElement("canvas");

    function adjust_size() {
      // http://joubert.posterous.com/crisp-html-5-canvas-text-on-mobile-phones-and
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth;
      canvas.style.height = window.innerHeight;

      // The buffer will be used only on platforms on which it is benefitial 
      // (some platforms gain much from using it while others perform slower)
      bufferCanvas.x = canvas.x;
      bufferCanvas.y = canvas.y;
      bufferCanvas.width = canvas.width;
      bufferCanvas.height = canvas.height;
      bufferCanvas.style.width = canvas.style.width;
      bufferCanvas.style.height = canvas.style.height;

      var c = canvas.getContext('2d');
      c.scale(window.devicePixelRatio, window.devicePixelRatio);
      var bc = bufferCanvas.getContext('2d');
      bc.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    window.onresize = function() {
      if (main && main.autoresize) {
        adjust_size();
      }
    };

    document.body.onorientationchange = function() {
      adjust_size();
    };

    setTimeout(function() { 
      window.scrollTo(0, 0);
      adjust_size();
      window.onresize();
    }, 0);

    adjust_size();
  }

  options = options || {};
  options.id = options.id || 'canvas';
  options.x = options.x || 0;
  options.y = options.y || 0;
  // TODO: deliberately binding with wrong names in order to get an autobind and not get the property bound to options cause then
  // in the box constructor it will already be a property and not transffer from attributes to obj. 
  // Need to fix this!!
  var hoptions;
  options.width = options.width || bind(hoptions, 'width', function() { return canvas.width / window.devicePixelRatio; });
  options.height = options.height || bind(hoptions, 'height', function() { return canvas.height / window.devicePixelRatio; });

  var main = box(options);

  main.domless = domless;
  main.canvas = canvas;
  main.bufferCanvas = bufferCanvas;

  // hook canvas events to `main.interact()`.
  capture(canvas, function(event, coords, e) {
    return main.interact(event, coords, e);
  });

  main.paused = options.paused;

  var fps_start_time = Date.now();
  var fps = 0;

  function redraw(force) {
    if (!force && main.paused) return; // stop redraw loop if we are paused.
    var ctx = canvas.getContext('2d');
    var bufferCtx = bufferCanvas.getContext('2d');

    // TODO: determine this var based on the platform on which we are running
    // (some platforms gain much from using it while others perform slower)
    var useBuffer = false;
    //TODO: since the canvas fills the screen we don't really need this?
    if (main.alpha && main.alpha() < 1.0) {
      if (useBuffer) {
        bufferCtx.clearRect(0, 0, canvas.width, canvas.height);  
      }
      else{
        ctx.clearRect(0, 0, canvas.width, canvas.height);   
      }
    }
    
    // TODO: passing many vars for calculations if to draw boxes or not, see if this optimization is indeed needed, and if so find better way to do it
    main.draw(useBuffer ? bufferCtx : ctx, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    if (useBuffer) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bufferCtx.canvas);
    }

    //TODO: maybe can do this in stead of scale..
    //ctx.drawImage(bufferCtx.canvas, 0, 0, 500, 500, 0,0,1000, 1000);

    var now = Date.now();
    var delta = now - fps_start_time;
    fps++;

    // emit fps every ~1sec
    if (delta >= 1000) {
      main.emit('fps', (fps / (delta / 1000)));
      console.log('fps: ', (fps / (delta / 1000)));
      fps = 0;
      fps_start_time = now;
    };

    if (!main.paused) window.requestAnimationFrame(redraw);
  }
  
  if (!main.paused) {
    redraw();
  }

  main.redraw = function() {
    redraw(true);
  };

  main.pause = function() {
    this.paused = true;
  };

  main.resume = function() {
    this.paused = false;
    redraw(); // kick start redraw
  };

  return main;
};});

require.define("/node_modules/uijs/lib/box.js",function(require,module,exports,__dirname,__filename,process){var defaults = require('./util').defaults;
var valueof = require('./util').valueof;
var propertize = require('./util').propertize;
var animate = require('./animation');
var autobind = require('./bind').autobind;

var EventEmitter = require('./events').EventEmitter;

var idgenerator = 0;

var box = module.exports = function(options) {
  var attributes = defaults(options, {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    children: [],
    rotation: 0.0,
    visible: true,
    clip: false,
    alpha: null,
    debug: false,
    interaction: true, // send interaction events on this box. must be set to true for events to be emitted
    autopropagate: true, // propagate interaction events to child boxes. if false, the parent needs to call `e.propagate()` on the event
    _id: 'BOX.' + idgenerator++,
  });

  attributes.id = attributes.id || attributes._id;
  
  // TODO: extend()
  var obj = new EventEmitter();

  for (var k in attributes) {
    obj[k] = attributes[k];
  }

  // Create properties from binded vars
  autobind(obj);

  obj.watch('children', function(c, bound) { 
    if (!bound) {
      var _push = c.push;

      c.forEach(function(i) {
        i.parent = obj;
      });

      c.push = function(child) {
        child.parent = obj;
        return _push.apply(c, arguments);
      };
    } else {
      console.warn('warning: box.children is bound to a function - child.parent will not be automatically set');
    }
  });

  obj._is_box  = true;

  /// ## Box Hierarchy
  /// Boxes have children and parents.

  // returns the root of the box hierarchy
  obj.root = function() {
    var self = this;
    if (!self.parent) return self;
    return self.parent.root();
  };

  // adds a child to the end of the children's stack.
  obj.add = obj.push = function(child) {
    var self = this;
    if (Array.isArray(child)) {
      return child.forEach(function(c) {
        self.add(c);
      });
    }

    if (!box.isbox(child)) {
      throw new Error('can only add boxes as children to a box');
    }

    child.parent = self;
    self.children.push(child);

    return child;
  };

  obj.tofront = function() {
    var self = this;
    if (!self.parent) throw new Error('`tofront` requires that the box will have a parent');
    var parent = self.parent;
    parent.remove(self);
    parent.push(self);
    return self;
  };

  obj.siblings = function() {
    var self = this;
    if (!self.parent) return [ self ]; // detached, no siblings but self
    return self.parent.all();
  };

  obj.prev = function() {
    var self = this;
    if (!self.parent) throw new Error('box must be associated with a parent')
    var children = self.parent.children;
    var my_index = children.indexOf(self);
    if (my_index === 0) return null;
    else return children[my_index - 1];
  };

  // removes a child (or self from parent)
  obj.remove = function(child) {
    var self = this;

    if (!child) {
      if (!self.parent) throw new Error('`remove()` will only work if you have a parent');
      self.parent.remove(self);
      return child;
    }

    var children = self.children;

    var child_index = children.indexOf(child);
    if (child_index === -1) return;
    children.splice(child_index, 1);
    child.parent = null;
    return child;
  };

  // removes all children
  obj.empty = function() {
    var self = this;
    self.children = [];
    return self;
  };

  // retrieve a child by it's `id()` property (or _id). children without
  // this property cannot be retrieved using this function.
  obj.get = function(id) {
    var self = this;
    var result = self.children.filter(function(child) {
      return child.id === id;
    });

    return result.length === 0 ? null : result[0];
  };

  // ### box.query(id)
  // Retrieves a child from the entire box tree by id.
  obj.query = function(id) {
    var self = this;
    var child = self.get(id);
    if (child) return child;

    var children = self.children;
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      var result = child.query(id);
      if (result) {
        return result;
      }
    }
  };

  /// ### box.all()
  /// Returns all the children of this box.
  obj.all = function() {
    var self = this;
    return self.children;
  };

  /// ### box.rest([child])
  /// Returns all the children that are not `child` (or do the same on the parent if `child` is null)
  obj.rest = function(child) {
    var self = this;
    if (!child) {
      if (!obj.parent) throw new Error('cannot call `rest()` without a parent');
      return obj.parent.rest(self);
    }

    return self.children.filter(function(c) {
      return c.id !== child.id;
    });
  };

  // returns the first child
  obj.first = function() {
    var self = this;
    return self.children[0];
  };

  // returns a tree representation this box and all it's children
  obj.tree = function(indent) {
    var box = this;
    indent = indent || 0;

    var s = '';
    for (var i = 0; i < indent; ++i) {
      s += ' ';
    }

    s += box.id + '\n';
    
    box.children.forEach(function(child) {
      s += child.tree(indent + 2);
    });

    return s;
  }

  /// ## Drawing

  function freezer(fn) {
    function freezerInnerFunction(){
      this.$freeze = {};
      
      var ret;
      var ex;

      try {
        ret = fn.apply(this, arguments);
      }
      catch (e) {
        ex = e;
      }

      delete this.$freeze;

      if (ex) throw ex;
      return ret;
    }

    return freezerInnerFunction;
  }

  
  /// ### box.draw(ctx)
  /// This function is called every frame. It draws the current box (by means of calling `ondraw`)
  /// and then draws the box's children iteratively. This function also implements a few of the basic
  /// drawing capabilities and optimizations: buffering, scaling, rotation.
  // TODO: passing many vars for calculations if to draw boxes or not, see if this optimization is indeed needed, and if so find better way to do it
  function draw(ctx, topLayerLeft, topLayerTop, topLayerRight, topLayerBottom, parentLayerLeft, parentLayerTop, parentLayerRight, parentLayerBottom) {
    var self = this;
    if (!self.visible || self.alpha === 0.0) return;
    
    // Return if this box is not in the visible area of the screen
    //TODO: If we know the axis on which the box moves, we can change the order of these tests and improve performance

    var selfY = self.y;
    //var myTop = parentLayerTop + selfY;
    //if (myTop > topLayerBottom){
    //  return;
    //}

    var selfHeight = self.height;
    //if (selfHeight <= 0) {return;};
    //var myBottom = myTop + selfHeight;
    //if (myBottom < topLayerTop){
    //  return;
    //}

    var selfX = self.x;
    //var myLeft = parentLayerLeft + selfX;
    //if (myLeft > topLayerRight){
    //  return;
    //}

    var selfWidth = self.width;
    //if (selfWidth <= 0) {return;};
    //var myRight = myLeft + selfWidth;
    //if (myRight < topLayerLeft) {
    //  return;
    //}

    ctx.save();

    if (self.rotation) {
      var centerX = selfX + self.Width / 2;
      var centerY = selfY + selfHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(self.rotation);
      ctx.translate(-centerX, -centerY);
    }

    // stuff that applies to all children
    ctx.translate(selfX, selfY);
    if (self.alpha) ctx.globalAlpha = self.alpha;

    if (self.clip) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(selfWidth, 0);
      ctx.lineTo(selfWidth, selfHeight);
      ctx.lineTo(0, selfHeight);
      ctx.closePath();
      ctx.clip();
    }

    var children = self.children;

    // stuff that applies only to this child
    ctx.save();

    // emit a `frame` event
    self.emit('frame');

    // call `ondraw` for rendering.
    if (self.ondraw) {
      if (selfWidth > 0 && selfHeight > 0) {
        self.ondraw(ctx);
      }
    }

    ctx.restore();

    children.forEach(function(child) {
      //TODO: do not draw child if out of viewport
      child.draw.call(child, ctx);
    });

    ctx.restore();
  };

  obj.draw = freezer(draw);

  // -- interactivity

  // given a `pt` in box coordinates, returns a child
  // that resides in those coordinates. returns { child, child_pt }
  // `filter` is a function that, if returns `false` will ignore a child.
  obj.hittest = function(pt, filter) {
    var self = this;

    if (!pt || !('x' in pt) || !('y' in pt)) return;

    // we go in reverse order because the box stack is based on this.
    var children = self.children.map(function(x){return x;}).reverse();

    for (var i = 0; i < children.length; ++i) {
      var child = children[i];

      // ignore child if filter is activated
      if (filter && !filter(child)) continue;

      if (pt.x >= child.x &&
          pt.y >= child.y &&
          pt.x <= child.x + child.width &&
          pt.y <= child.y + child.height) {
        
        // convert to child coords
        var child_x = pt.x - child.x;
        var child_y = pt.y - child.y;

        return {
          child: child,
          child_pt: { x: child_x, y: child_y }
        };
      }
    }

    return null;
  };
  
  obj.interact = function(event, pt) {
    var self = this;

    // emit events for all children that required to capture them.
    self._emit_captures(event, pt);

    // if this box does not interaction events, ignore.
    if (!self.interaction) return;

    // queue the event locally to this box (if not capturing)
    if (self.debug) console.log('[' + self.id + ']', event, pt);
    if (!self.capturing()) {
      self.emit(event, pt);
    }

    // nothing to do if `propagate` is false.
    if (self.autopropagate) {
      self.propagate(event, pt);
    }

    // delete all captures that were stopped during this cycle.
    // if we delete them immediately, we get duplicate events if `stopCapture`
    // is called by the event handler (and then self.capturing() is true).
    self._delete_captures();

    return true;
  };

  // propagates an event to any child box that is hit by `pt`.
  // `pt` is in box coordinates and the event is propagated in child coordinates.
  obj.propagate = function(event, pt) {
    var self = this;

    // check if the event should be propagated to one of the children
    var hit = self.hittest(pt, function(child) { return child.interaction; });
    if (hit) {
      return hit.child.interact(event, hit.child_pt);
    }

    return false;
  };

  // returns the screen coordinates of this obj
  obj.screen = function() {
    var self = this;

    if (self.canvas) {
      return {
        x: self.canvas.offsetParent.offsetLeft + self.canvas.offsetLeft,
        y: self.canvas.offsetParent.offsetTop + self.canvas.offsetTop,
      };
    }

    var pscreen = self.parent ? self.parent.screen() : { x: 0, y: 0 };
    return {
      x: pscreen.x + self.x,
      y: pscreen.y + self.y,
    };
  };

  // translates `pt` in the current box's coordinates to `box` coordinates.
  obj.translate = function(pt, box) {
    var boxscreen = box.screen();
    var myscreen = this.screen();
    return {
      x: pt.x + myscreen.x - boxscreen.x,
      y: pt.y + myscreen.y - boxscreen.y,
    };
  };

  // -- capture events

  // emits events to all boxes that called `startCapture`.
  obj._emit_captures = function(event, pt) {
    var self = this;
    if (!self._captures) return; // no captures on this level (only on root)
    for (var id in self._captures) {
      var child = self._captures[id];
      var child_pt = self.translate(pt, child);
      child.emit(event, child_pt);
    }
  };

  // delete all captures that were stopped during this event cycle
  obj._delete_captures = function() {
    var self = this;
    if (!self._captures_to_delete) return;
    if (self._captures) {
      self._captures_to_delete.forEach(function(id) {
        delete self._captures[id];
      });
    }

    self._captures_to_delete = [];
  };

  // registers this box to receive all interaction events until `stopCapture` is called.
  obj.startCapture = function() {
    var root = this.root();
    var captures = root._captures;
    if (!captures) captures = root._captures = {};
    captures[this._id] = this;
  };

  // stops sending all events to this box.
  obj.stopCapture = function() {
    var root = this.root();
    var captures = root._captures;
    if (!captures) return;
    if (!root._captures_to_delete) {
      root._captures_to_delete = [];
    }
    root._captures_to_delete.push(this._id);
  };

  // returns true if events are currently captured by this box.
  obj.capturing = function() {
    var root = this.root();
    var captures = root._captures;
    if (!captures) return false;
    return this._id in captures;
  };

  // some sugar events/gestures

  obj.on('touchstart', function() {
    this.startCapture();
  });

  obj.on('touchend', function(pt) {
    this.stopCapture();

    if (!pt ||
        pt.x < 0 || pt.x > this.width ||
        pt.y < 0 || pt.y > this.height) {
      return;
    }

    this.emit('click', pt);
  });

  // -- animation

  obj.animate = function(properties, options) {
    var self = this;
    Object.keys(properties).forEach(function(k) {
      var curr = self[k];
      var target = properties[k];
      if (self.debug) console.log('[' + self.id + ']', 'animating', k, 'from', curr, 'to', target);
      self[k] = animate(curr, target, options);
    });
  };  

  return obj;
};

box.isbox = function(obj) {
  return obj._is_box || obj._is_view;
};});

require.define("/node_modules/uijs/lib/util.js",function(require,module,exports,__dirname,__filename,process){var EventEmitter = require('./events').EventEmitter;

exports.min = function(a, b) { return a < b ? a : b; };
exports.max = function(a, b) { return a > b ? a : b; };

// returns a function that creates a new object linked to `this` (`Object.create(this)`).
// any property specified in `options` (if specified) is assigned to the child object.
exports.derive = function(options) {
  return function() {
    var obj = Object.create(this);
    obj.base = this;
    if (options) {
      for (var k in options) {
        obj[k] = options[k];
      }
    }
    return obj;
  };  
};

// returns the value of `obj.property` if it is defined (could be `null` too)
// if not, returns `def` (or false). useful for example in tri-state attributes where `null` 
// is used to disregard it in the drawing process (e.g. `fillStyle`).
exports.valueof = function(obj, property, def) {
  if (!obj) throw new Error('`obj` is required');
  if (!def) def = false;
  if (!(property in obj)) return def;
  else return obj[property];
};

exports.defaults = function(target, source) {
  var valueof = exports.valueof;

  target = target || {};

  for (var k in source) {
    target[k] = valueof(target, k, source[k]);
  }

  return target;
};

exports.loadimage = function(src) {
  if (typeof src === 'function') src = src();
  
  var img = new Image();
  img.src = src;
  img.onload = function() { };

  return img;
};

exports.linearGradient = function(ctx, gradientColors, x1, y1, x2, y2){
  if (!gradientColors) return;
  /*
  The createLinearGradient() function takes 4 parameters: x1, y1, x2, y2.
  These 4 parameters determine the direction and extension of the gradient pattern.
  The gradient extends from the first point x1, y1 to the second point x2, y2.
  */
  var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  
  for (var i = 0; i < gradientColors.length - 1; i++) {
    gradient.addColorStop(i/(gradientColors.length-1),gradientColors[i])
  }
  gradient.addColorStop(1, gradientColors[gradientColors.length - 1]);
  
  return gradient;
};
});

require.define("/node_modules/uijs/lib/events.js",function(require,module,exports,__dirname,__filename,process){function EventEmitter() {
  var self = this;
  
  self._subscriptions = {};
  self._pipes = [];

  return self;
}

EventEmitter.prototype.emit = function(event) {
  var self = this;

  var handlers = self._subscriptions[event];
  var original_arguments = arguments;

  var handled;

  if (handlers) {
    var args = [];
    for (var i = 1; i < arguments.length; ++i) {
      args.push(arguments[i]);
    }

    handlers.forEach(function(fn) {
      var ret = fn.apply(self, args);
      if (typeof ret === 'undefined' || ret === true) handled = true;
      if (ret === false) handled = false;
    });
  }


  // emit events on all pipes
  self._pipes.forEach(function(target) {
    var ret = target.emit.apply(target, original_arguments);
    if (typeof ret === 'undefined' || ret === true) handled = true;
    if (ret === false) handled = false;
  });

  return handled;
};

// emits the event (with arguments) after 100ms
// should be used to allow ui to update when emitting
// events from event handlers.
EventEmitter.prototype.queue = function(event) {
  var self = this;
  var args = arguments;
  setTimeout(function() {
    self.emit.apply(self, args);
  }, 5);
};

EventEmitter.prototype.on = function(event, handler) {
  var self = this;
  if (!self._subscriptions) return;
  var handlers = self._subscriptions[event];
  if (!handlers) handlers = self._subscriptions[event] = [];
  handlers.push(handler);

  return self;
};

EventEmitter.prototype.removeAllListeners = function(event) {
  var self = this;
  if (!self._subscriptions) return;
  delete self._subscriptions[event];
  return self;
};

EventEmitter.prototype.removeListener = 
EventEmitter.prototype.off = function(event, handler) {
  var self = this;
  if (!self._subscriptions) return;
  var handlers = self._subscriptions[event];

  var found = -1;
  for (var i = 0; i < handlers.length; ++i) {
    if (handlers[i] === handler) {
      found = i;
    }
  }

  if (found !== -1) {
    handlers.splice(found, 1);
  }

  return self;
};

// forward all events from this EventEmitter to `target`.
EventEmitter.prototype.forward = function(target) {
  var self = this;
  self._pipes.push(target);
  return self;
};

// remove a forward
EventEmitter.prototype.unforward = function(target) {
  var self = this;
  var i = self._pipes.indexOf(target);
  if (i === -1) return false;
  self._pipes.splice(i, 1);
  return true;
};

exports.EventEmitter = EventEmitter;});

require.define("/node_modules/uijs/lib/animation.js",function(require,module,exports,__dirname,__filename,process){// -- animation
var curves = exports.curves = {};

curves.linear = function() {
  return function(x) {
    return x;
  };
};

curves.easeInEaseOut = function() {
  return function(x) {
    return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
  };
};

module.exports = function(from, to, options) {
  options = options || {};
  options.duration = options.duration || 250;
  options.ondone = options.ondone || function() { };
  options.curve = options.curve || curves.easeInEaseOut();
  options.name = options.name || from.toString() + '_to_' + to.toString();

  var startTime = Date.now();
  var endTime = Date.now() + options.duration;
  var callbackCalled = false;

  return function () {
    if (typeof from === 'function') from = from.call(this);
    if (typeof to === 'function') to = to.call(this);

    var elapsedTime = Date.now() - startTime;
    var ratio = elapsedTime / options.duration;
    if (ratio < 1.0) {
      curr = from + (to - from) * options.curve(ratio);
    }
    else {
      // console.timeEnd(options.name);
      curr = to;
      if (options.ondone && !callbackCalled) {
        options.ondone.call(this);
        callbackCalled = true;
      }
    }
    return curr;
  };
};});

require.define("/node_modules/uijs/lib/bind.js",function(require,module,exports,__dirname,__filename,process){var EventEmitter = require('./events').EventEmitter;

function addWatch(obj){
  if (obj.$watch) { return; };
  obj.$watch = new EventEmitter();
  obj.watch = function(prop, cb) {
    var curr = obj[prop];
    
    // Only bind if 'prop' is not yet bounded
    if(!obj.$boundedVars || !obj.$boundedVars[prop]) {
      bind(obj, prop, function() { return curr; }, false);
    }
    
    cb.call(obj, curr, false);
    return this.$watch.on(prop, cb);
  };

  obj.unwatch = function(prop, cb) {
    return this.$watch.off(prop, cb);
  };
}

function bind(obj, prop, getter, emit) {
  if (obj === undefined) {
    return { $bind: getter };
  }

  if (typeof emit === 'undefined') {
    emit = true;
  }

  // add `watch` capability to object.
  addWatch(obj);

  // add indication the 'prop' is bounded
  if(!obj.$boundedVars) {
    obj.$boundedVars = {};
  }
  obj.$boundedVars[prop] = true;

  getter = getter || function() { return undefined; };

  function setter(newval) {
    if (newval && newval.$bind) {  //TODO: When does newval has $bind on it. Is it because we bind below and the return the binding promise and we dont want to rebind?
      bind(obj, prop, newval.$bind);
      return newval;
    }

    bind(obj, prop, function() { return newval; }, false);

    // emit a change event on the $watch event emitter, if defined.
    emit_change(newval, false);

    return newval;
  }

  Object.defineProperty(obj, prop, {
    configurable: true,
    enumerable: true,
    get: getter,
    set: setter,
  });

  // emit a change event to indicate that we have made a new bind
  if (emit) {
    emit_change(getter, true);
  }

  function emit_change(newval, bound) {
    if (!obj.$watch) return;
    obj.$watch.emit(prop, newval, bound);
  }

  return { $bind: getter };
}

function autobind(obj) {
  Object.keys(obj).forEach(function(k) {
    var val = obj[k];
    if (val && val.$bind) {
      bind(obj, k, val.$bind);
    }
  });

  // add `watch` capability to object. Needed if none of the keys $bind set
  addWatch(obj);
  return obj;
}

module.exports = bind;
module.exports.autobind = autobind;});

require.define("/node_modules/uijs/lib/interaction.js",function(require,module,exports,__dirname,__filename,process){// maps DOM events to uijs event names
var EVENTS = {
  ontouchstart: 'touchstart',
  ontouchmove : 'touchmove',
  ontouchend  : 'touchend',
  onmousedown : 'touchstart',
  onmousemove : 'touchmove',
  onmouseup   : 'touchend',
};

function capture(el, fn) {

  // bind to all mouse/touch interaction events
  Object.keys(EVENTS).forEach(function(k) {
    el[k] = function(e) {
      var name = EVENTS[k];
      e.preventDefault();
      var coords = (name !== 'touchend' || !e.changedTouches) ? relative(e) : relative(e.changedTouches[0]);
      return fn(name, coords, e);
    };
  });

  // get the coordinates for a mouse or touch event
  // http://www.nogginbox.co.uk/blog/canvas-and-multi-touch
  function relative(e) {
    if (e.touches && e.touches.length > 0) {
      e = e.touches[0];
      return { x: e.pageX - el.offsetLeft, y: e.pageY - el.offsetTop };
    }
    else if (e.offsetX) {
      // works in chrome / safari (except on ipad/iphone)
      return { x: e.offsetX, y: e.offsetY };
    }
    else if (e.layerX) {
      // works in Firefox
      return { x: e.layerX, y: e.layerY };
    }
    else if (e.pageX) {
      // works in safari on ipad/iphone
      return { x: e.pageX - el.offsetLeft, y: e.pageY - el.offsetTop };
    }
  }

}

exports.capture = capture;});

require.define("/node_modules/uijs/lib/html.js",function(require,module,exports,__dirname,__filename,process){var box = require('./box');
var util = require('./util');
var capture = require('./interaction').capture;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    html: '<div>',
    interaction: false, // by default we let HTML capture events
  }));

  var last_bounds = null;

  obj.on('frame', function() {
    var self = this;

    var pt = this.screen();
    var bounds = pt.x + ',' + pt.y + ' ' + this.width + 'x' + this.height;

    if (bounds !== last_bounds) {
      var div = self._container(); // ensure that the element exists.

      // update bounds
      div.style.left = pt.x;
      div.style.top = pt.y;
      div.style.width = this.width;

      // clip to parent bounds or nasty things will happen.
      div.style.height = util.min(this.height, this.parent.height - this.y);

      last_bounds = bounds;
    }
  });

  Object.defineProperty(obj, 'container', {
    get: function() {
      var self = this;
      if (!self._div) return null;
      return self._container();
    },
  })

  // returns the `div` container that hosts this tag.
  // the div will be created and appended to the document body
  // if it ain't.
  obj._container = function() {
    var self = this;
    var div = self._div;
    if (!div) {
      div = self._div = document.createElement('div');
      div.style.overflow = 'auto';
      div.style.position = 'absolute';
      document.body.appendChild(self._div);

      div.innerHTML = self.html;

      if (self.interaction) {
        capture(div, function(event, pt, e) {
          // we need to pass the interaction data to the canvas
          var root = self.root();
          var spt = self.screen();
          root.interact(event, {
            x: pt.x + spt.x,
            y: pt.y + spt.y,
          }, e);
        });
      }

      if (self.onload) {
        self.onload(div);
      }
    }

    return div;
  };

  return obj;
};});

require.define("/node_modules/uijs/lib/positioning.js",function(require,module,exports,__dirname,__filename,process){//
// attributes

var attributes = {};

attributes.top = attributes.y = function(box, delta) {
  return box.y + (delta || 0);
};

attributes.left = attributes.x = function(box, delta) { 
  return box.x + (delta || 0);
};

attributes.right = function(box, delta) {
  return box.x + box.width + (delta || 0);
};

attributes.bottom = function(box, delta) {
  return box.y + box.height + (delta || 0);
};

attributes.width = function(box, delta) {
  return box.width + (delta || 0);
};

attributes.height = function(box, delta) {
  return box.height + (delta || 0);
};

attributes.centerx = function(box, delta) {
  return box.width / 2 - this.width / 2 + (delta || 0);
};

attributes.centery = function(box, delta) {
  return box.height / 2 - this.height / 2 + (delta || 0);
};

// export all attributed positional functions
for (var k in attributes) {
  exports[k] = attributes[k];
}

//
// relations

var zero = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

exports.parent = mkrelational(function() {
  if (!this.parent) throw new Error('no parent');
  return this.parent;
});

exports.prev = mkrelational(function() {
  if (!this.parent) throw new Error('no parent no prev()');
  var prev = this.prev();

  // if no prev, it means we are the first, so just assume all 0
  if (!prev) return zero;

  return prev;
});

exports.relative = function(query) {
  return mkrelational(function() {
    var box = this.root().query(query);
    if (!box) return zero;
    return box;
  });
};

// --- private

// returns a hash of positional attributed functions bound to the
// box returned by the `related` function.
function mkrelational(related) {
  if (!related || typeof related !== 'function') throw new Error('`related` must be a function');
  var functions = {};
  Object.keys(attributes).forEach(function(attr) {
    var attrfn = attributes[attr];
    functions[attr] = function(delta) {
      return function() {
        var self = this;
        delta = delta || 0;
        return attrfn.call(self, related.call(self), delta);
      };
    };
  });

  return functions;
}});

require.define("/node_modules/uijs/lib/kinetics.js",function(require,module,exports,__dirname,__filename,process){function c(x) { return function() { return x; }; }

function calculateDirection(velocity){
  return Math.abs(velocity) / velocity;
}

function calculateSpeed(v0, acceleration, friction, delta_ts){
  var delta_speed = acceleration * delta_ts;
  return v0 * friction + delta_speed;
}

function calculatePosition(x0, velocity, delta_ts){
  var delta_x = velocity * delta_ts;
  return x0 += delta_x;    
}

function surfaceWithForces(options){
  options = options || {};
  var friction = options.friction || c(0.993);
  var last_ts = Date.now();
  // The time delta for which to calculate the spring action (in seconds). If not set then will take from intervals between calls to the returned function, starting from now
  var delta_ts = options.delta_ts || function(){
    var now = Date.now();
    var calculatedDelta = (now - last_ts) / 1000;
    last_ts = now;
    return calculatedDelta;
  };
  var time_unit = options.time_unit ? options.time_unit() : 0.001; //(In seconds) The calculation will be done for each time unit 
  var acceleration = options.acceleration || c(0);

  var returnValue = {
    position: options.initialPosition ? options.initialPosition() : 0,      
    velocity: options.initialVelocity ? options.initialVelocity() : 0.0, // In pixels per second
    
    animate: function(){
      var self = this;
      var timespan = delta_ts();
      for (var i = 0; i < timespan; i += time_unit) {
        self.velocity = calculateSpeed(self.velocity, acceleration(), friction(), time_unit);
        self.position = calculatePosition(self.position, self.velocity, time_unit);
      }
      return self.position;
    },
  }

  return returnValue;
}

function springAnimation(base, elasticity, options){
  options = options || {};
  var elasticity = options.elasticity || c(65);
  var swf;
  var calculateAcceleration = function(){
    return -((swf.position - base) * elasticity);
  };

  options.friction = options.friction || c(0.995);
  if (options.acceleration) {alert("Cannot define acceleration for a spring, just elasticity and base");};
  options.acceleration = calculateAcceleration;
  var swf = surfaceWithForces(options);

  return swf;    
}

function basicSliderAnimation(options){
  options = options || {};
  options.friction = options.friction || c(0.995);
  return surfaceWithForces(options);
}

function carouselAnimation(carouselleftBase, carouselRightBase, initialPosition, initialVelocity, inSpringMode, initialSpringBase, options){

  options = options || {};
  var elasticity = options.elasticity || c(65);
  var springFriction = options.springFriction || c(0.993);
  var regularFriction = options.regularFriction || c(0.995);
  var springVelocityThreshold = options.springVelocityThreshold || c(300); //Under this velocity (in pixels per sec) the surface will become a spring whose base is the current position
  var time_unit = options.time_unit = options.time_unit || c(0.001); //(In seconds) The calculation will be done for each time unit 
  var last_ts = Date.now();
  // The time delta for which to calculate the spring action (in seconds). If not set then will take from intervals between calls to the returned function, starting from now
  var delta_ts = options.delta_ts || function(){
    var now = Date.now();
    var calculatedDelta = (now - last_ts) / 1000;
    last_ts = now;
    return calculatedDelta;
  };

  var swf;
  var direction = calculateDirection(initialVelocity());
  var nonSpringAcceleration = options.nonSpringAcceleration || function() {return -((swf.velocity / 0.5) + (100 * direction));};

  var determineSpring = function(){
    var leftBase = carouselleftBase();
    var rightBase = carouselRightBase();

    if (swf.position > leftBase) {
      swf.spring = true;
      swf.spring_base = leftBase;
    }
    else if (swf.position < rightBase) {
      swf.spring = true;
      swf.spring_base = rightBase;
    }
    else if (!swf.spring && Math.abs(swf.velocity) < springVelocityThreshold()) {
      swf.spring = true;
      swf.spring_base = swf.position;
    }
  };

  var now = Date.now();
  var options = {
    initialPosition: initialPosition,
    initialVelocity: initialVelocity,
    delta_ts: delta_ts,
    time_unit: time_unit,
    acceleration: function(){
      determineSpring();
      if (swf.spring) {
        return -((swf.position - swf.spring_base) * elasticity());
      }
      else{
        return nonSpringAcceleration();
      }
    },
    friction: function(){  
      determineSpring();
      if (swf.spring) {
        return springFriction();
      }
      else{
        return regularFriction();
      }
    },
  };
  swf = surfaceWithForces(options);
  swf.spring_base = initialSpringBase();
  swf.spring = inSpringMode();
  return swf;
}

function carouselBehavior(spring_left_base, spring_right_base, spring_max_stretch, eventHistory, onClick, options){
  options = options || {};

  var last_touch_position = 0;
  var last_position = 0;
  var last_timestamp;
  var last_speed; // In pixels per second
  var touching = false;
  var moving = false;
  var spring = false;
  var spring_base = 0;

  return function(){
    while (eventHistory.length > 0){
      var oldestEvent = eventHistory.shift();
      var previous_touch_position = last_touch_position;
      last_touch_position = oldestEvent.position;
      var previous_touch_timestamp = last_timestamp;
      last_timestamp = oldestEvent.timestamp;
        
      if (oldestEvent.name === "touchstart") {
        touching = true;
        moving = false;
        spring = false;
      }

      if (oldestEvent.name === "touchmove") {
        touching = true;
        moving = true;
        var delta_position = last_touch_position - previous_touch_position;
        var delta_ts = (last_timestamp - previous_touch_timestamp) / 1000; //In seconds
        if ((last_position > spring_left_base() && delta_position > 0) || (last_position < spring_right_base() && delta_position < 0)) {
          spring = true;
          if (last_position > spring_left_base()) {
            spring_base = spring_left_base();  
          }
          else{
            spring_base = spring_right_base();
          }
          delta_position = (spring_max_stretch() - ((last_position - spring_base) * calculateDirection(delta_position)) ) / spring_max_stretch() * delta_position; 
        }
        else{
          spring = false;
        }
        last_speed = delta_position / delta_ts;
        if(last_speed > 3500){
          last_speed = 3500;
        }

        last_position += delta_position;
      }

      if (oldestEvent.name === "touchend") {
        touching = false;
        if (!moving) { //We've detected a click without a move!!
          console.log('click', previous_touch_position);
          onClick(previous_touch_position, this);
        }
      }
    }
      
    var swf;
    if ((!isNaN(last_speed) && !touching) && moving){
      var now = Date.now();
      options.delta_ts = c((now - last_timestamp) / 1000);
      swf = carouselAnimation(spring_left_base, spring_right_base, c(last_position), c(last_speed), c(spring), c(spring_base), options);
      last_position = swf.animate();
      spring = swf.spring;
      spring_base = swf.spring_base;
      last_timestamp = now;
      last_speed = swf.velocity;
    }

    return last_position;
  }
}

exports.carouselBehavior = carouselBehavior;});

require.define("/node_modules/uijs/lib/scroller.js",function(require,module,exports,__dirname,__filename,process){var box = require('./box');
var kinetics = require('./kinetics');
var defaults = require('./util').defaults;
var min = require('./util').min;
var max = require('./util').max;
var scrollbar = require('./scrollbar');
var bind = require('./bind');

module.exports = function(options) {
  var obj = box(defaults(options, {
    clip: true,
  }));

  var bar = scrollbar({ 
    height: bind(bar, 'height', function() { return obj.height; }),
    size: bind(bar, 'size', function() {
      return obj.height / obj.content.height;
    }),
    position: bind(bar, 'position', function() {
      return -obj.content.y / obj.content.height;
    }),
    x: bind(bar, 'x', function() {
      return obj.width - this.width;
    }),
  });

  obj.children = bind(obj, 'children', function() { 
    obj.content.parent = obj;
    bar.parent = obj;
    return [ obj.content, bar ]; 
  });

  var events = [];

  obj.watch('content', function(value) { 
    if (!value) { return; }; // This can happen if setting the watch when the content is undefined (upon setting a watch this callback is called with the current value)
    value.yAnimation = kinetics.carouselBehavior(
      function() { return 0; },
      function() { return obj.height - obj.content.height; },
      function() { return 100; },
      events,
      function() { },
      { regularFriction: function() { return 0.997; } });
    value.y = bind(value, 'y', function(){
      var result = Math.round(value.yAnimation());
      return result;
    });
  });

  obj.ondraw = function(ctx) {
    ctx.fillStyle = 'white';

    ctx.fillRect(0, 0, this.width, this.height);
  };

  obj.on('touchstart', function(coords) {
    this.startCapture();
    events.push({name: 'touchstart', position: coords.y, timestamp: Date.now()});
  });

  obj.on('touchmove', function(coords) {
    if (!this.capturing()) return;
    events.push({name: 'touchmove', position: coords.y, timestamp: Date.now()});
  });

  obj.on('touchend', function(coords) {
    this.stopCapture();
    events.push({name: 'touchend', position: coords.y, timestamp: Date.now()});
  });

  return obj;
};});

require.define("/node_modules/uijs/lib/scrollbar.js",function(require,module,exports,__dirname,__filename,process){var box = require('./box');
var defaults = require('./util').defaults;
var min = require('./util').min;
var max = require('./util').max;

module.exports = function(options) {
  var obj = box(defaults(options, {
    position: 0.3,
    size: 0.5,
    interaction: false,
    width: 10,
  }));

  obj.ondraw = function(ctx) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineCap = 'round';
    ctx.lineWidth = this.width;
    ctx.beginPath();

    var barstart = 8;
    var barheight = this.height - 16;

    var barposition = this.position * barheight;
    var barsize = this.size * barheight;

    ctx.moveTo(0, max(barstart + barposition, barstart));
    ctx.lineTo(0, min(barstart + barposition + barsize, barstart + barheight));
    ctx.stroke();
  }; 

  return obj;
};});

require.define("/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"lib/index"}});

require.define("/lib/index.js",function(require,module,exports,__dirname,__filename,process){exports.image = require('./image');
exports.button = require('./button');
exports.label = require('./label');
exports.rect = require('./rect');
exports.listview = require('./listview');
exports.activity = require('./activity');});

require.define("/lib/image.js",function(require,module,exports,__dirname,__filename,process){var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    image: null,
    stretchWidth: false,
    stretchHeight: false,
    fit: false,
    horizontalAlign: 'center',
    verticalAlign: 'middle',
    adaptSizeAccordingToImage:false,
    width: 50,
    height: 50,
  }));

  function renderImage(ctx, img, x, y, w, h){
    ctx.drawImage(img, x, y, w, h);
  }

  function onDrawImage(ctx){
    var self = this;

    if (!self.image) return;

    var img = self.image;
    if (!img) return;
    w = img.width;
    h = img.height;
    if (w === 0 || h === 0) return;

    var strw = self.stretchWidth;
    var strh = self.stretchHeight;
    var boxw = self.width;
    var boxh = self.height;
    var x, y, w, h;

    if(w > boxw || h > boxh)
    {
      //resize width
      h = h * boxw/w;
      w = boxw;
      //resize height if needed 
      if(h > boxh)
      {
        w = w * boxh/h;
        h = boxh;
      } 
    }

    if(self.fit) {
      if(boxw/w <= boxh/h) {
        h = h * boxw/w;
        w = boxw;
      }
      else {
        w = w * boxh/h;
        h = boxh;
      }
    }
    else {
      if (strw) {
        h = Math.min(h * boxw/w,boxh);
        w = boxw;  
      }
      if (strh) {
        w = Math.min(w * boxh/h,boxw);
        h = boxh;
      }
    }
    
    switch (self.horizontalAlign) {
      case 'left':
        x = 0;
        break;

      case 'right':
        x = boxw - w;
        break;

      case 'center':
      default:
        x = boxw / 2 - w / 2;
        break;
    }

   switch (self.verticalAlign) {
      case 'top':
        y = 0;
        break;

      case 'bottom':
        y = boxh - h;
        break;

      case 'middle':
      default:
        y = boxh / 2 - h / 2;
        break;
    } 
    
    renderImage(ctx, img, x, y, w, h);
  }

  obj.ondraw = onDrawImage;

  return obj;
};});

require.define("/lib/button.js",function(require,module,exports,__dirname,__filename,process){var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var image = require('./image');
var label = require('./label');
var positioning = uijs.positioning;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box({
    alpha: bind(obj, 'alpha', function() {return this._touching ? 0.8 : 1.0;}),
  });

  obj.on('touchstart', function() {
    console.log('touch start');
    this._touching = true;
    this.startCapture();
  });

  obj.on('touchend', function(e) {
    console.log('touch end');
    this._touching = false;
    this.stopCapture();
    
    // touchend outside
    if (e.x < 0 || e.x > this.width ||
        e.y < 0 || e.y > this.height) {
      return;
    }

    this.emit('click');
  });

  return obj;
};});

require.define("/lib/label.js",function(require,module,exports,__dirname,__filename,process){var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;

module.exports = function(options) {
  var obj = box(defaults(options, {
    text: '',
    size: 20,
    font: 'Helvetica',
    color: 'black',
    bold: false,
    italic: false,
    border: null,
    shadow: null,
    center: false,
    height: options.size ? options.size + 20/100 * options.size : 20,
    renderBorder: function(ctx) {
      ctx.strokeStyle = 'yellow';
      ctx.strokeRect(0, 0, this.width, this.height);
    },
    renderShadow: function(ctx){
      ctx.shadowBlur = 2;
      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    },
  }));

  function renderLabel(ctx, text, x, y){
    ctx.fillText(text, x, y);
  }

  function onDrawLabel(ctx){
    var self = this;
    var text = self.text;

    if (!text) return;

    if(self.border) { self.renderBorder(ctx);}
    
    ctx.fillStyle = self.color;
    
    var size = self.size;
    var italic = self.italic;
    var font = self.font;
    var bold = self.bold;
    var calculatePlacement = false;
    if (self.prevBold !== bold || self.prevItalyc !== italic || self.prevSize !== size || self.prevFont !== font) {
      self.prevBold = bold;
      self.prevItalyc = italic;
      self.prevSize = size;
      self.prevFont = font;  
      self.fontCache = ((bold) ? 'bold ' : '') + ((italic) ? 'italic ' : '') + size + 'px ' + font; 
      calculatePlacement = true;
    };
    ctx.font = self.fontCache;

    if (self.textCache !== text || calculatePlacement) {
      self.textCache = text;
      self.mesurementCache = ctx.measureText(self.textCache);
      calculatePlacement = true;
    };

    var w = self.width;
    var h = self.height;
    if (self.widthCache !== w || self.heightCache !== h){
        calculatePlacement = true;
        self.widthCache = w;
        self.heightCache = h;
    }

    var center = self.center;
    if (self.centerCache !== center) {
      calculatePlacement = true;
      self.centerCache = center;
    };
    
    if (calculatePlacement) {
      self.xPosCache = self.center ? w / 2 - self.mesurementCache.width / 2 - 1 : 0;
      self.yPosCache = 0;//h / 2 - size / 2 + size - 20/100 * size;
    }

    if(self.shadow) {self.renderShadow(ctx);}
    renderLabel(ctx, text, self.xPosCache, self.yPosCache);
  }

  obj.ondraw = onDrawLabel;

  return obj;
}});

require.define("/lib/rect.js",function(require,module,exports,__dirname,__filename,process){var uijs = require('uijs');
var box = uijs.box;
var defaults = uijs.util.defaults;

module.exports = function(options) {
  	var obj = box(defaults(options, {
    	color: 'gray',
  	}));

    function renderRect(ctx, x, y, w, h){
      ctx.fillRect(x, y, w, h);
    }

    function onDrawRect(ctx){
      var self = this;
      
      ctx.fillStyle = self.color;
      renderRect(ctx, 0, 0, self.width, self.height);
    }

   	obj.ondraw = onDrawRect;

	return obj;
}; });

require.define("/lib/listview.js",function(require,module,exports,__dirname,__filename,process){var uijs = require('uijs');
var rectSeperator = require('./rect');
var label = require('./label');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var scroller = uijs.scroller;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = scroller(defaults(options, {
    itemHeight : 70,
    items: [],
    onBindBoxItem: function(boxItem) { 
      if(boxItem.data.title){
        boxItem.add(label({text: boxItem.data.title,}));  
      }
    }, 
  }));

  var cashPool = [];

  var content = box({
    children: bind(content, 'children', function() { 
      var self = this;

      var startItemIndex = util.max(Math.floor(-self.y/obj.itemHeight),0);
      var endItemIndex = util.min(Math.ceil(obj.height/obj.itemHeight) + startItemIndex,obj.items.length);

      if(cashPool.length == 0 && obj.items.length > 0){
        //TODO: improve the API. I dont like it that we bind to some irrelevant data object here and change the data property later to rebind without using the data bind function
        for (var poolIndex = startItemIndex; poolIndex < endItemIndex; poolIndex++) {
          var boxItem = box({
            height:obj.itemHeight,
            width:obj.width,
            data:obj.items[0],
            parent:obj,
          });

          obj.onBindBoxItem(boxItem);

          //add box item as to the cash pool
          cashPool.push(boxItem);
        }
      }
      var i = 0;
      for (var key = startItemIndex; key < endItemIndex; key++) {
        var boxItem = cashPool[i];
        boxItem.data = obj.items[key],
        
        //update item positioning
        boxItem.x = 0;
        boxItem.y =  key * obj.itemHeight ;
        i++;
      }
      return cashPool;
    }), 
    height: bind(content, 'height', function(){ return obj.itemHeight * obj.items.length }),
    width: bind(content, 'width', function(){ return obj.width; }),
    interaction: false,
  });

  obj.content = content;
  return obj;
};
});

require.define("/lib/activity.js",function(require,module,exports,__dirname,__filename,process){var uijs = require('uijs');
var box = uijs.box;
var util = uijs.util;
var defaults = util.defaults;
var bind = uijs.bind;

module.exports = function(options) {
  var obj = box(defaults(options, {
    animating: true,
    visible: bind(obj, 'visible', function() { return this.animating; }),
    lineType: 'dot', // 'dot' or 'line' (default 'dot')
    height: 50,
    width: 50,
  }));

  var numberOfLines = 12;
  var lineRatio = function () {
    if (obj.lineType == 'line') {
      return 0.6;
    }
    return 0.51;
  }

  obj.ondraw = function (ctx) {
    var self = this;
    lines.forEach(function (line, i) {      
      ctx.beginPath();
      ctx.moveTo(line.x1(), line.y1());
      ctx.lineTo(line.x2(), line.y2());
      ctx.lineWidth = line.width();
      var idx = Math.round(self.index + i) % numberOfLines;
      ctx.strokeStyle = line.color(idx);
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  };

  var start = Date.now();
  obj.index = bind(obj, 'index', function() {
    var delta = Date.now() - start;
    var rps = 1 * 1000; // rounds per seconds
    return ((delta % rps) / rps) * lines.length;
  });

  function line(index) {
    var angle = index * Math.PI * 2 / numberOfLines;
    var highlight = 0xF7F7F7;
    var baseColor = 0x6A6A6A;
    var deltaColor = 0xC0C0C; 
    var minColor = highlight - numberOfLines * deltaColor;

    
    var fullLength = function () { return Math.min(obj.width, obj.height) / 2; };
    var length = function () { return Math.round(fullLength() * lineRatio()); };
    var radius = function () { return fullLength() - length(); };

    return { 
      x1: function() { return obj.width / 2 + radius() * Math.cos(angle); },
      y1: function() { return obj.height / 2 + radius() * Math.sin(angle); },
      x2: function() { return obj.width / 2 + length() * Math.cos(angle); },
      y2: function() { return obj.height / 2 + length() * Math.sin(angle); },
      width: function () {  return fullLength() / numberOfLines * 2 ; },
      color: function(index) {
        var color = highlight - index * deltaColor;
        if (color < minColor) {
          color = baseColor;
        }
        return '#' + color.toString(16);
      },
    };
  }
  

  var lines = [];
  function initLines() {
    for (var i = 0; i < numberOfLines; i++) {
      lines.push(line(i));
    };
  };
  initLines();

  return obj;
};



});

require.define("/sample/.tmp.51288.entry.activity-sample.js",function(require,module,exports,__dirname,__filename,process){window.require = require;

// lazy require so that app code will not execute before onload
Object.defineProperty(window, 'main', {
  get: function() {
    return require('./activity-sample.js');
  }
});});
require("/sample/.tmp.51288.entry.activity-sample.js");
})();
