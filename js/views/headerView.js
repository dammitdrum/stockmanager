define([
	'marionette',
	'backbone',
	'app',
	'moment'
	],
	function(Marionette,Backbone,App,moment){

	return Marionette.ItemView.extend({
		className: 'wrap clearfix',
		ui: {
			nav: '.nav a',
			hour: '.js_hour',
			min: '.js_min',
			dots: '.js_dots',
			date: '.js_date',
			day: '.js_day_week',
			profile: '.js_profile'
		},
		modelEvents: {
			'change':'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[1]);
			setInterval(this.upTime.bind(this),500);
		},
		onRender: function() {
			var self = this;
			$(window).bind('hashchange', function(){
				self.setActive(window.location.hash);
			});
			moment.locale('ru');
		},
		upTime: function() {
			this.ui.hour.text(moment().format('HH'));
			this.ui.min.text(moment().format('mm'));
			this.ui.dots.toggleClass('fadein');
			this.ui.date.text(moment().format('DD MMMM YYYY'));
			this.ui.day.text(moment().format('dddd'));
		},
		onDomRefresh: function() {
			this.setActive(window.location.hash);
			$('body').addClass('loaded');
		},
		setActive: function(hash) {
			this.ui.nav.removeClass('active');
			this.ui.profile.removeClass('active');
			this.ui.nav.each(function() {
				var href = $(this).attr('href');
				if (href === hash) {
					$(this).addClass('active');
					return;
				};
			});
			if (hash === '#profile') {
				this.ui.profile.addClass('active');
			};
			hash === '' ? 
				App.headerRegion.$el.addClass('grad'):
				App.headerRegion.$el.removeClass('grad');
		}
	});

})