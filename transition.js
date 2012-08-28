function Transition(options){
	this._init(options);
	return this;
}


Transition.prototype = {
	defaults: function() {
		var self = this;
		return {
		name: 'Transition.js',
		contentClass: 'content',
		linkSelector: '.transition',
		oldClass: 'transition-old',
		newClass: 'transition-new',
		transitionFunc: self.fade,
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

		$(this.settings.linkSelector).click(this._clicked());

		var self = this;
		window.addEventListener("popstate", function(e) {
			self._swapContent(location.pathname);
		});
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
		$.get(href, function(data) {
			var content = self._getContent(data, set.contentClass);

			$("." + set.contentClass).children().addClass(set.oldClass);

			$(content.innerHTML).addClass(set.newClass)
			.hide()
			.appendTo($("." + set.contentClass));

			set.transitionFunc(set.oldClass, set.newClass, function() {
				$("." + set.newClass).removeClass(set.newClass);
				$("." + set.oldClass).remove();
				set.completeCallback();
			});
		});
	},

	_getContent: function(html, content_class) {
		var content = document.createElement('div');
		content.innerHTML = html;
		content = content.getElementsByClassName(content_class)[0];
		return content;
	},

	fade: function(oldClass, newClass, callback) {
		$("." + oldClass).fadeOut('', function() {
			$("." + newClass).fadeIn('', callback);
		});

	}
};

