define([
	'marionette',
	'app',
	'moment',
	'dateRange'
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
					self.triggerMethod('filter:active',self.collection);
				},4);
			};
		},
		changeActive: function(e) {
			var name = $(e.currentTarget).find('.js_name').text();
			var model = this.collection.findWhere({'name':name});
			model.get('active') ? 
				model.set('active',false) : model.set('active',true);
			this.triggerMethod('filter:active',this.collection);
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

	var orderFilters = Marionette.CompositeView.extend({
		className: 'controls clearfix',
		childView: filterView,
		childViewContainer: "#filter_list",
		ui: {
			li: '.js_period li',
			date: '.js_date_range',
			search: '#search',
		},
		events: {
			'click @ui.li': 'setPeriod',
			'keyup @ui.search': 'searchHandler'
		},
		childEvents: {
			'filter:active': 'filterManager'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[17]);
			this.filter = {
				status: this.model.get('status'),
				markets: [],
				from: moment().subtract(1,'y').format('DD.MM.YY'),
				to: moment().format('DD.MM.YY')
			};
		},
		onDomRefresh: function() {
			var self = this;
			this.ui.date.daterangepicker({
			    "showDropdowns": true,
			    "locale": {
			        "format": "DD.MM.YY",
			        "separator": "  -  ",
			        'applyLabel':'Показать',
			        "daysOfWeek": ["В","П","В","С","Ч","П","С"],
			        "monthNames": ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
			        "firstDay": 1
			    },
			    "linkedCalendars": true,
			    "startDate": self.filter.from,
			    "minDate": "01.01.15",
			    "maxDate": "01.01.25"
			}, function(start, end, label) {
			  	self.filter.from = moment(start).format('DD.MM.YY');
			  	self.filter.to = moment(end).format('DD.MM.YY');
			  	self.ui.li.removeClass('active');
			  	self.triggerMethod('filter:orders',self.filter);
			});
			
			this.triggerMethod('filter:orders',this.filter);
		},
		setPeriod: function(e) {
			var el = $(e.target),
				sub = el.attr('data-period');

			this.ui.li.removeClass('active');
			el.addClass('active');
			this.filter.from = moment().subtract(1,sub).format('DD.MM.YY');
			el.hasClass('js_yesterday') ?
				this.filter.to = moment().subtract(1,sub).format('DD.MM.YY'):
				this.filter.to = moment().format('DD.MM.YY');
			this.ui.date.data('daterangepicker').setStartDate(this.filter.from);
			this.ui.date.data('daterangepicker').setEndDate(this.filter.to);
			this.triggerMethod('filter:orders',this.filter);
		},
		searchHandler: function() {
			this.triggerMethod('search:orders',this.ui.search.val());
		},
		filterManager: function(child,markets) {
			var self = this;
			this.filter.markets = [];
			markets.each(function(market) {
				market.get('active') ? 
					self.filter.markets.push(market.get('name')):'';
			});
			this.triggerMethod('filter:orders',this.filter);
			
		},
		onBeforeDestroy: function() {
			$('.daterangepicker').remove();
		},
	});

	var tabView = Marionette.ItemView.extend({
		className: 'top_tabs',
		ui: {
			tabs: '[data-tab]',
			screens: '.js_screen_tab'
		},
		events: {
			'click @ui.tabs': 'setTab',
		},
		modelEvents: {
			'change':'render'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[20]);
		},
		setTab: function(e) {
			if($(e.target).hasClass('active')) return;
			this.ui.tabs.removeClass('active');
			$(e.target).addClass('active');
			this.triggerMethod('set:tab',$(e.target).attr('data-tab'));
		},
	})

	return {
		filters: filters,
		backStock: backStock,
		orderFilters: orderFilters,
		tabView: tabView,
	}

})