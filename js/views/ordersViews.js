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
		},
		select: function() {
			this.triggerMethod('show:detail',this.model.get('doors'));
		}
	});
	

	var ordersView = Marionette.CollectionView.extend({
		childView: orderItem,
		className: 'curr_orders clearfix',
		childEvents: {
			'show:detail':'setActive',
		},
		initialize: function() {
			this.count = 0;
		},
		onDomRefresh: function() {
			if(this.model.get('complite')) {
				this.$el.addClass('complite');
			}
		},
		onAddChild: function(child) {
			this.count++;
			if(this.count%4 === 0) {
				child.$el.addClass('after');
			};
		},
		setActive: function(child) {
			this.children.findByIndex(this.children.length - 1).$el.addClass('after');
			this.children.each(function(view) {
				if(view===child) return;
				view.$el.removeClass('active');
			});
			child.$el.toggleClass('active');

			if (child.$el.hasClass('active')) {
				this.triggerMethod('order:active',child.$el);
			}
		}
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

	return {
		orders: ordersView,
		ordersDetail: ordersDetailView
	}

})