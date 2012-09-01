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
		content: 'section',
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
		this._swapContent(href);
		history.pushState(null, null, href);
	},

	_init: function(options) {
		this.firstRun = true; // Prevent popstate from reloading on first run.
		this._createSettings(options);
		this.go = this.go.bind(this);
		this._swapContent = this._swapContent.bind(this);
		$(this.settings.content).addClass(this.settings.active.slice(1));
		$(this.settings.links).click(this._clicked());
		this._cache();
		var self = this;
		window.addEventListener("popstate", function(e) {
			self._swapContent(location.href);
		});
	},

	_cache: function() {
		this.cache.init(this.settings);
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

	_swapContent: function(href) {
		if (this.firstRun){
			return;
		}
		var self = this;
		var set = self.settings;
		var $new = this.cache.get(href);
		if ($new.hasClass(set.active.slice(1))) {
			return;
		}
		var $old = $(set.active);

		$old.addClass(set.old.slice(1));
		$new.addClass(set.current.slice(1)).hide();

		set.beginCallback();

		set.transitionFunc(set.old, set.current, function() {
				$old.hide().removeClass(set.active.slice(1))
				.removeClass(set.old.slice(1));
				window.scrollTo(0, 0);
				$new.removeClass(set.current.slice(1))
				.addClass(set.active.slice(1));
				self.cache.cleanInitial();
				set.completeCallback();
			});
	}
};


Transition.prototype.cache = {
	init: function(sett) {
		this.settings = sett;
		var self = this;
		this._markInitalContent();
		$(sett.links).each(function() {
			self._getContent(this.href);
		});
	},

	get: function(href) {
		var hash = this._hash(href);
		return $('.' + hash);
	},

	cleanInitial: function() {
		$('.trans-initial').remove();
	},

	_markInitalContent: function() {
		$(this.settings.content).addClass('trans-initial');
	},

	_getContent: function(href) {
		var self = this;
		this._getPage(href, function(html) {
			var content = document.createElement('div');
			content.innerHTML = html;
			content = $(self.settings.content, content);

			content.each(function() {
				$(this).addClass(self._hash(href))
				.hide()
				.appendTo($(self.settings.contentHolder));
			});
		});

	},

	_getPage: function(href, callback) {
		$.get(href, function(data) {
			callback(data);
		});
	},

	_hash: function(href) {
		var hash = 0;
		if (href.length === 0) return hash;
		for (i = 0; i < href.length; i++) {
			char = href.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		hash = "trans-" + hash;
		return hash;
	}
};

Transition.prototype.transitions = {
	fade: function(oldSelector, newSelector, callback) {
		$(oldSelector).fadeOut('', function() {
			$(newSelector).fadeIn('', callback);
		});

	}
};
