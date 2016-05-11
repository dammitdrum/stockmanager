//webshims global

define([
	'marionette',
	'app',
	'moment'
	],function(Marionette, App, moment){

	var backStock = Marionette.ItemView.extend({
		className: 'back_stock',
		ui: {
			link: '.js_back'
		},
		events: {
			'click @ui.link': 'backNavigate'
		},
		initialize: function() {
			this.template = _.template('<span class="js_back">Вернуться на шаг назад</span>');
		},
		backNavigate: function() {
			window.history.back();
		}
	});

	var filterItemView = Marionette.ItemView.extend({
		tagName: 'li',
		initialize: function() {
			this.template = _.template('<i></i><span class="js_name"><%=name%></span>');
		},
		onRender: function() {
			if (this.model.get('active')) {
				this.$el.addClass('active');
			}
		}
	});

	var filterView = Marionette.CompositeView.extend({
		className: 'dropdown',
		attributes: {
			"data-toggle": "dropdown"
		},
		childView: filterItemView,
		childViewContainer: "#filter_list",
		ui: {
			li: 'li'
		},
		events: {
			'click @ui.li': 'changeActive'
		},
		initialize: function() {
			this.template = _.template(App.Templates[2]);
			this.collection = this.model.get('list');
		},
		onRender: function() {
			if (this.collection.where({'active':true}).length) {
				var self =this;
				setTimeout(function() {
					self.triggerMethod('filter:active');
				},4);
			};
		},
		changeActive: function(e) {
			var name = $(e.currentTarget).find('.js_name').text();
			var model = this.collection.findWhere({'name':name});
			model.get('active') ? 
				model.set('active',false) : model.set('active',true);
			this.triggerMethod('filter:active');
		}
	});

	var filters = Marionette.CompositeView.extend({
		childView: filterView,
		childViewContainer: "#filters",
		ui: {
			search: '#search'
		},
		events: {
			'keyup @ui.search': 'searchHandler'
		},
		childEvents: {
		    'filter:active':'filterHandler'
		},
		initialize: function() {
			this.template = _.template(App.Templates[3]);
		},
		searchHandler: function() {
			this.triggerMethod('search:doors',this.ui.search.val());
		},
		filterHandler: function() {
			this.ui.search.val('');
			this.triggerMethod('filter:doors',this.collection);
		}
	});

	var orderFilters = Marionette.ItemView.extend({
		className: 'controls clearfix',
		ui: {
			li: '.js_period li',
			date: '.js_date',
			search: '#search'
		},
		events: {
			'click @ui.li': 'clickPeriod',
			'change @ui.date':'changePeriod',
			'keyup @ui.search': 'searchHandler'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[17]);
			this.filter = {
				from: moment().subtract(1,'w').format('DD.MM.YY'),
				to: moment().format('DD.MM.YY'),
				complete: this.model.get('complete')
			};
		},
		onDomRefresh: function() {
			webshims.setOptions('forms-ext', {types: 'date'});
			webshims.polyfill('forms forms-ext');
			this.setPeriod();
		},
		clickPeriod: function(e) {
			var sub = $(e.target).attr('data-period');
			this.ui.li.removeClass('active');
			$(e.target).addClass('active');
			this.filter.from = moment().subtract(1,sub).format('DD.MM.YY');
			this.filter.to = moment().format('DD.MM.YY');
			this.setPeriod();
		},
		changePeriod: function(e) {
			var el = $(e.target),
				to = moment(this.filter.to,'DD.MM.YY'),
				from = moment(this.filter.from,'DD.MM.YY'),
				val = moment(el.val(),'YYYY-MM-DD');

			if (el.hasClass('js_from')) {
				if (to.diff(val,'days') < 0) {
					el.val(to.format('YYYY-MM-DD'));
				};
				this.filter.from = val.format('DD.MM.YY');
			} else {
				if (from.diff(val,'days') > 0) {
					el.val(from.format('YYYY-MM-DD'));
				};
				this.filter.to = val.format('DD.MM.YY');
			};
			this.ui.li.removeClass('active');
			this.triggerMethod('filter:period',this.filter);
		},
		setPeriod: function() {
			this.ui.date.eq(0).val(
				moment(this.filter.from,'DD.MM.YY').format('YYYY-MM-DD')
			);
			this.ui.date.eq(1).val(
				moment(this.filter.to,'DD.MM.YY').format('YYYY-MM-DD')
			);
			this.triggerMethod('filter:period',this.filter);
		},
		searchHandler: function() {
			this.triggerMethod('search:orders',this.ui.search.val());
		},
	});

	return {
		filters: filters,
		backStock: backStock,
		orderFilters: orderFilters
	}

})