define(['marionette','app'],function(Marionette,App){

	
	var orderItem = Marionette.ItemView.extend({
		className: 'box',
		ui: {
			
		},
		events: {
			'click':'select'
		},
		initialize: function() {
			this.template = _.template(App.Templates[13]);
			this.stop = false;
		},
		select: function() {
			this.triggerMethod('show:detail',this.model.get('doors'),this.stop);
		}
	});
	

	var ordersView = Marionette.CompositeView.extend({
		childView: orderItem,
		className: 'curr_orders clearfix',
		childViewContainer: "#orders_list",
		childEvents: {
			'show:detail':'setActive',
		},
		collectionEvents: {
			'change':'render'
		},
		ui: {
			more: '.js_more'
		},
		events: {
			'click @ui.more': 'getMore'
		},
		initialize: function() {
			this.template = _.template('<div id="orders_list"></div><%if(nav){%><button class="more_orders js_more">Показать более поздние заказы</button><%}%>');
			this.count = 0;
		},
		onDomRefresh: function() {
			if(this.model.get('complete')) {
				this.$el.addClass('complete');
			};
		},
		onAddChild: function(child) {
			this.count++;
			if(this.count%4 === 0) {
				child.$el.addClass('after');
			};
		},
		setActive: function(child) {
			if (!child.stop) {
				this.children.findByIndex(this.children.length - 1).$el.addClass('after');
				this.children.each(function(view) {
					if(view===child) return;
					view.$el.removeClass('active');
				});
				child.$el.toggleClass('active');
			}
		},
		getMore: function() {
			this.triggerMethod('get:moreOrders');
		},
	});

	var doorItemView = Marionette.ItemView.extend({
		tagName: 'tr',
		ui: {
			toggle: '[data-toggle="modal"]'
		},
		events: {
			'click @ui.toggle': 'showModal'
		},
		modelEvents: {
			'change':'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[15]);
		},
		showModal: function() {
			this.triggerMethod('render:detailModal',this.model);
		}
	});

	var ordersDetailView = Marionette.CompositeView.extend({
		className: 'table',
		tagName: 'table',
		childView: doorItemView,
		childViewContainer: "tbody",
		ui: {
			sort: '[data-sort]'
		},
		events: {
			'click @ui.sort': 'sortHandler'
		},
		collectionEvents: {
			'sort':'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[14]);
			this.model = new Backbone.Model({'cost':''}); // model for sorting
		},
		sortHandler: function(e) {
			var prop = $(e.target).attr('data-sort'),
				model = this.model;
			this.collection.comparator = function(door) {
				return model.get(prop) ?
					-door.get('price')*door.get('order').quantity:
					door.get('price')*door.get('order').quantity;
			};
			model.get(prop) ? model.set(prop,''):model.set(prop,'up');
			this.collection.sort();
		}
	});

	var emptyResultView = Marionette.ItemView.extend({
		className: 'search_res_empty',
		initialize: function() {
			this.template = _.template('<p class="mess">Ничего не найдено <%if(typeof query !== "undefined"){%>по запросу <b class="js_res">"<%=query%>"</b><%}%></p>');
		}
	});

	var preloadView = Marionette.ItemView.extend({
		className: 'preloader',
		initialize: function() {
			this.template = _.template('<div id="loader"></div>');
		}
	});

	return {
		orders: ordersView,
		ordersDetail: ordersDetailView,
		emptyResult: emptyResultView,
		preload: preloadView
	}

})