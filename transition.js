function Transition(options){
	this._init(options);
	this.self = this;
	return this;
}


Transition.prototype = {
	defaults: function() {
		var self = this;
		return {
		name: 'Transition.js',
		contentHolder: '.content',
		links: '.transition',
		old: '.transition-old',
		current: '.transition-new',
		active: '.transition-active',
		transitionFunc: self.transitions.fade,
		beginCallback: function() {},
		completeCallback: function() {}
		};
	},

	go: function(href) {
		this._transition(href);
		history.pushState(null, null, href);
	},

	_init: function(options) {
		this.firstRun = true; // Prevent popstate from reloading on first run.
		this._createSettings(options);
		this.go = this.go.bind(this);
		this._swapContent = this._swapContent.bind(this);

		$(this.settings.links).click(this._clicked());

		this.scrollPos = 0;

		setInterval(this._getScrollPos(), 1000);

		var self = this;
		window.addEventListener("popstate", function(e) {
			// Hack to stop back button from scrolling.
			$(window).scrollTo(self.scrollPos);
			$(self.settings.links).each(function() {
				if (this.href === location.href) {
					self._transition(location.href);
				}
			});
		});
	},

	_getContent: function(href, callback) {
		this.ajax.get(href, this.settings.contentHolder, callback);
	},

	_createSettings: function(options) {
		options = options || {};
		this.settings = $.extend({}, this.defaults(), options);
	},

	_clicked: function() {
		var self = this;
		return function(e) {
			self.firstRun = false;
			e.preventDefault();
			self.go(this.href);
		};
	},

	_transition: function(href) {
		if (this.firstRun){
			return;
		}
		var self = this;
		this._getContent(href, function(content) {
			self._swapContent(content);
		});
	},

	_swapContent: function(content) {

		var self = this;
		var set = self.settings;
		var $new = $(content);
		var $old = $(set.contentHolder);

		$new.addClass(set.current.slice(1)).hide();
		$old.addClass(set.old.slice(1)).after($new);

		set.beginCallback();

		set.transitionFunc(set.old, set.current, function() {
				$old.remove();
				window.scrollTo(0, 0);
				$new.removeClass(set.current.slice(1));
				set.completeCallback();
			});
	},

	_getScrollPos: function() {
		var self = this;
		return function() {
			self.scrollPos = $(window).scrollTop();
		};
	}
};


Transition.prototype.ajax = {

	get: function(href, holder, callback) {
		var self = this;
		this._getPage(href, function(pageHTML) {
			var content = self._getContent(pageHTML, holder);
			callback(content);
		});
	},

	_getContent: function(pageHTML, holder) {
		var self = this;
		var content = document.createElement('div');
		content.innerHTML = pageHTML;
		content = content.getElementsByClassName(holder.slice(1))[0];
		// var content = $('<div>').html(pageHTML).find(holder)[0];
		return content;
	},

	_getPage: function(href, callback) {
		$.get(href, function(data) {
			callback(data);
		});
	}
};

Transition.prototype.transitions = {
	fade: function(oldSelector, newSelector, callback) {
		$(oldSelector).fadeOut('', function() {
			$(newSelector).fadeIn('', callback);
		});

	}
};
