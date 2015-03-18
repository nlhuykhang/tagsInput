/**
 *  @name tags-input
 *  @description tags input plugin
 *  @version 1.0
 *  @options
 *    typeAhead
 *    afterAdd
 *    afterRemove
 *    afterRemoveAll
 *  @events
 *    keydown
 *    click
 *  @methods
 *    init
 *    addTag
 *    getTags
 *    getHighlightTags
 *    removeTag
 *    removeAll
 *    destroy
 */
;(function($, window, undefined) {
  var pluginName = 'tags-input';

  var inputGetFocus = function() {
    $(this).children('input').focus();
  };

  var addItem = function(val) {
    if (isValValid(val)) {
      if ($.inArray(val, getItems.call($(this).closest('div'))) === -1) {
        $(this).before('<span class="tag label label-info">' +
          val + '<span data-role="remove"></span></span>');
      }
    }
  };

  var isValValid = function(val) {
    return typeof val === "string" && val && val[0] !== ' ' && val[0] !== '\n';
  };

  var runIfValEmpty = function(val, cb) {
    if (!isValValid(val)) {
      if (typeof cb === 'function') {
        cb();
      }
    }
  };

  var deleteItem = function() {
    $(this).parent().remove();
  };

  var getItems = function(selector) {
    var re = [];
    this.children('span' + (typeof selector === 'string' ? selector : '')).each(function() {
      re.push($(this).text());
    });
    return re;
  };

  var tagChangeState = function() {
    var tagEl = $(this);
    if (tagEl.hasClass('active')) {
      tagEl.removeClass('active');
    } else {
      tagEl.addClass('active');
    }
  };

  var isArray = function(val) {
    if (typeof Array.isArray === 'function') {
      return Array.isArray(val);
    } else {
      return Object.prototype.toString.call(val) === 'object Array';
    }
  };

  var keyProcessing = function(key) {
    var inputEl = $(this),
      val = inputEl.val(),
      ENTER = 13,
      DELETE = 46,
      BACK_SPACE = 8,
      LEFT = 37,
      RIGHT = 39;
    switch (key) {
      case ENTER:
        addItem.call(this, val);
        inputEl.val('');
        break;
      case DELETE:
        runIfValEmpty(val, function() {
          inputEl.next().remove();
        });
        break;
      case BACK_SPACE:
        runIfValEmpty(val, function() {
          inputEl.prev().remove();
        });
        break;
      case LEFT:
        runIfValEmpty(val, function() {
          inputEl.insertBefore(inputEl.prev()).focus();
        });
        break;
      case RIGHT:
        runIfValEmpty(val, function() {
          inputEl.insertAfter(inputEl.next()).focus();
        });
        break;
      default:
        break;
    }
  };

  var divClickHandler = function(e) {
    inputGetFocus.call(this);
  };

  var inputKeyDownHandler = function(e) {
    var key = e.which;
    keyProcessing.call(this, key);
  };

  var spanRemoveClickHandler = function(e) {
    e.preventDefault();
    deleteItem.call(this);
  };

  var spanTagClickHander = function(e) {
    e.preventDefault();
    tagChangeState.call(this);
  };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this,
        inputEl = this.element.children('input');
      this.element.addClass('tagsinput')
        .on('click', divClickHandler)
        .on('click', '[data-role=remove]', spanRemoveClickHandler)
        .on('click', '.tag', spanTagClickHander);
      inputEl.on('keydown', inputKeyDownHandler);

      if (this.options.typeAhead &&
        'source' in this.options.typeAhead &&
        isArray(this.options.typeAhead.source)) {
        this.options.typeAhead.source.forEach(function(val) {
          addItem.call(inputEl, val);
        });
      }
    },
    addTag: function(params) {
      var valueTag = '';
      if (typeof params === 'string') {
        valueTag = params;
      } else {
        if ('val' in params && typeof params.val === 'string') {
          valueTag = params.val;
        }
      }
      if (isValValid(valueTag)) {
        addItem.call(this.element.children('input'), valueTag);
        this.options.afterAdd && this.options.afterAdd();
      }
    },
    removeTag: function(params) {
      var i = -1;
      if (typeof params === 'number') {
        i = params;
      } else {
        if ('index' in params && typeof params.index === 'number') {
          i = params.index;
        }
      }
      if (i !== -1) {
        this.element.children('span:eq(' + i + ')').remove();
        this.options.afterRemove && this.options.afterRemove();
      }
    },
    removeAll: function(params) {
      this.element.children('span').remove();
      this.options.afterRemoveAll && this.options.afterRemoveAll();
    },
    getTags: function(params) {
      var tags = getItems.call(this.element);
      if (typeof params === 'function') {
        params(tags);
      } else {
        return tags;
      }
    },
    getHighlightTags: function(params) {
      var classSelector = '.active',
        tags = getItems.call(this.element, classSelector);
      if (typeof params === 'function') {
        params(tags);
      } else {
        return tags;
      }
    },
    destroy: function() {
      $.removeData(this.element[0], pluginName);
      this.element.removeClass('tagsinput');
      this.element.children().remove();
    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      } else {
        window.console && console.log(options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized');
      }
    });
  };

  $.fn[pluginName].defaults = {};

  $(function() {
    $('[data-' + pluginName + ']')[pluginName]({
      afterAdd: function() {
        console.log('after add');
      },
      afterRemove: function() {
        console.log('after remove');
      },
      afterRemoveAll: function() {
        console.log('after remove all');
      },
      typeAhead: {
        source: ['1', '2', '3']
      }
    });
  });
}(jQuery, window));