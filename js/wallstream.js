(function() {
  var WallStream, WallStreamCore,
    __slice = [].slice;

  String.prototype.camelize = function() {
    return this.split(/-/).reduce(function(a, b) {
      if (/^\w+$/.test(b)) {
        return a + (a ? b[0].toUpperCase() : b[0]) + b.slice(1);
      } else {
        return a;
      }
    });
  };

  WallStream = (function() {
    var defaults;

    defaults = {
      template: '<p id="<%=id%>"><%=comment%></p>',
      maxPosts: 10,
      insertPosition: "before"
    };

    function WallStream(el, options) {
      var $el, callback, renderPost, stream;
      if (options == null) {
        options = {};
      }
      $el = $(el);
      options = $.extend({}, defaults, options);
      this.$el = $el;
      renderPost = function(post) {
        var $html, html, maxPosts, posts, sliceOptions, template;
        template = $.isFunction(options.template) ? options.template(post) : options.template;
        html = WallStream.tmpl(template, post);
        callback(options.beforeInsert, html, post);
        if (options.insertPosition === "before") {
          $el.prepend($html = $(html));
        } else {
          $el.append($html = $(html));
        }
        if ((maxPosts = options.maxPosts) !== false) {
          sliceOptions = {
            after: [0, maxPosts * -1],
            before: [maxPosts]
          };
          posts = $el.children();
          posts.slice.apply(posts, sliceOptions[options.insertPosition]).remove();
        }
        return callback(options.afterInsert, $html, post);
      };
      callback = function() {
        var args, callback;
        callback = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if ($.isFunction(callback)) {
          return callback.apply(window, args);
        }
      };
      stream = new WallStreamCore($.extend(options, {
        onPost: renderPost
      }));
      this.stop = stream.stop;
      this.start = stream.start;
      this.destroy = function() {
        stream.destroy();
        stream = null;
        return $el.trigger("wallstream.destroyed");
      };
    }

    return WallStream;

  })();

  window.WallStream = WallStream;

  WallStreamCore = (function() {
    var defaults;

    defaults = {
      interval: 5000,
      initialLimit: 10,
      accessToken: null,
      fields: [],
      types: [],
      host: "beta.walls.io",
      path: "/api/posts.json",
      onPost: function() {}
    };

    function WallStreamCore(options) {
      var delayed, fetch, latestId, params, stopped;
      options = $.extend({}, defaults, options);
      options.interval = Math.max(options.interval, 1000);
      latestId = null;
      stopped = true;
      if (!options.accessToken) {
        throw new Error("WallStreamCore: Access token missing");
      }
      params = {
        access_token: options.accessToken,
        limit: options.initialLimit,
        fields: options.fields,
        types: options.types
      };
      if (params.fields.indexOf("id") === -1 && params.fields.length > 0) {
        params.fields.push("id");
      }
      fetch = function() {
        if (latestId) {
          params.after = latestId;
        }
        return $.getJSON("https://" + options.host + options.path + "?callback=?&" + ($.param(params)), (function(_this) {
          return function(result) {
            var post, timeout, _i, _len, _ref, _ref1, _ref2;
            if (stopped) {
              return;
            }
            delete params.limit;
            if ((result != null ? result.data.length : void 0) > 0) {
              latestId = result != null ? (_ref = result.data) != null ? _ref[0].id : void 0 : void 0;
            }
            _ref2 = result != null ? (_ref1 = result.data) != null ? _ref1.reverse() : void 0 : void 0;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              post = _ref2[_i];
              options.onPost(post);
            }
            return timeout = delayed(fetch, options.interval);
          };
        })(this));
      };
      delayed = function() {
        var args, callback, ms;
        callback = arguments[0], ms = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        return setTimeout((function(_this) {
          return function() {
            return callback.apply(_this, args);
          };
        })(this), ms);
      };
      this.destroy = function() {
        return this.stop();
      };
      this.start = function() {
        if (stopped) {
          stopped = false;
          fetch();
        }
        return this;
      };
      this.stop = function() {
        var timeout;
        stopped = true;
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        return this;
      };
      this.start();
    }

    return WallStreamCore;

  })();

  window.WallStreamCore = WallStreamCore;

  (function() {
    var cache, tmpl;
    cache = {};
    window.WallStream.tmpl = tmpl = function(str, data) {
      var fn;
      fn = (!/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');"));
      if (data) {
        return fn(data);
      } else {
        return fn;
      }
    };
  })();

}).call(this);
