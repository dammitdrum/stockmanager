define(['marionette','app','backbone'],function(Marionette,App,Backbone){

	var stockItemView = Marionette.ItemView.extend({
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
			this.template = _.template(App.Templates[4]);
		},
		onRender: function() {
			this.model.get('order') ?
				this.$el.addClass('active') : this.$el.removeClass('active')
		},
		showModal: function(e) {
			if ($(e.target).hasClass('js_to_order')) {
				this.triggerMethod('render:addModal',this.model);
			} else {
				this.triggerMethod('render:detailModal',this.model);
			}
		}
	});

	var stockListView = Marionette.CompositeView.extend({
		className: 'table table_stock',
		tagName: 'table',
		childView: stockItemView,
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
			this.template = _.template(App.Templates[5]);
			this.model = new Backbone.Model({'price':''});//for sorting model
		},
		sortHandler: function(e) {
			var prop = this.ui.sort.attr('data-sort'),
				model = this.model;
			this.collection.comparator = function(door) {
				if (model.get(prop)) {
					return -door.get(prop);
				} else {
					return door.get(prop);
				}
			};
			model.get(prop) ? model.set(prop,''):model.set(prop,'up');
			this.collection.sort();
		}
	});

	var orderItemView = Marionette.ItemView.extend({
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
			this.template = _.template(App.Templates[10]);
		},
		showModal: function(e) {
			if ($(e.target).hasClass('js_to_order')) {
				this.triggerMethod('render:addModal',this.model);
			} else {
				this.triggerMethod('render:detailModal',this.model);
			}
		}
	});

	var orderListView = Marionette.CompositeView.extend({
		className: 'table table_order',
		tagName: 'table',
		childView: orderItemView,
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
			this.template = _.template(App.Templates[9]);
			this.model = new Backbone.Model({
				'price':'',
				'cost':''
			}); // model for sorting
		},
		sortHandler: function(e) {
			var prop = $(e.target).attr('data-sort'),
				model = this.model;
			this.collection.comparator = function(door) {
				if (model.get(prop)) {
					return prop==='cost' ?
						-door.get('price')*door.get('order').quantity : -door.get(prop);
				} else {
					return prop==='cost' ?
						door.get('price')*door.get('order').quantity : door.get(prop);
				}
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

	return {
		stockList: stockListView,
		orderList: orderListView,
		emptyResult: emptyResultView
	}

})