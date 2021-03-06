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

		var self = this;
		var first_time = true;
		window.addEventListener("popstate", function(e) {
			// Chome fires popstate on page load...
			if (first_time) {
				first_time = false;
				return;
			}
			// Reload last page b/c popstate scroll bug.
			$(self.settings.links).each(function() {
				if (this.href === location.href) {
					window.location.replace(location.href);
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
	}

};


Transition.prototype.ajax = {
	get: function(href, holder, callback) {
		var self = this;
		$('<div>').load(href + " " + holder, function(text) {
			callback(this);
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
