define(['marionette','app','entities'],function(Marionette,App,Entities){

	var orderItem = Marionette.ItemView.extend({
		className: 'box',
		events: {
			'click':'select'
		},
		modelEvents: {
			'change':'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[13]);
			this.stop = false;
			var sum = 0;
			
			this.model.get('doors').each(function(door) {
				var price = Entities.doorsStock.findWhere({
					id: door.get('id')
				}).get('price');
				sum += door.get('order').quantity*price;
			});
			this.model.set('total',sum);
		},
		onDomRefresh: function() {
			if (this.model.get('status')==='canceled') {
				this.$el.addClass('canceled');
			};
		},
		select: function() {
			this.triggerMethod('show:detail',this.model);
		}
	});
	

	var ordersView = Marionette.CollectionView.extend({
		childView: orderItem,
		className: 'curr_orders clearfix',
		childEvents: {
			'show:detail':'setActive',
		},
		ui: {
			more: '.js_more'
		},
		events: {
			'click @ui.more': 'getMore'
		},
		initialize: function() {
			this.count = 0;
		},
		onDomRefresh: function() {
			var status = this.model.get('status');

			if (_.find(status,function(str) {return str === 'history'})) {
				this.$el.addClass('complete');
			};
			if (_.find(status,function(str) {return str === 'new'})) {
				this.$el.addClass('new');
			};
			if (_.find(status,function(str) {return str === 'approved'})) {
				this.$el.removeClass('new').addClass('curr');
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
			this.door = Entities.doorsStock.findWhere({
				id: this.model.get('id')
			}).clone();
		},
		serializeData: function() {
			this.door.set({'order': this.model.get('order')});
			var obj = this.door.toJSON();
			obj["role"] = App.user.get('role');
			obj["mode"] = this.mode;
			obj["status"] = this.status;
			return obj;
		},
		showModal: function(e) {
			if ($(e.target).hasClass('js_to_edit')) {
				this.triggerMethod('request:collection');
			} else {
				this.triggerMethod('render:detailModal',this.door);
			}
		}
	});

	var ordersDetailView = Marionette.CompositeView.extend({
		childView: doorItemView,
		childViewContainer: "tbody",
		ui: {
			sort: '[data-sort]',
			approve: '.js_approve',
			cancel: '.js_cancel'
		},
		events: {
			'click @ui.sort': 'sortHandler',
			'click @ui.approve': 'approveHandler',
			'click @ui.cancel': 'cancelHandler'
		},
		collectionEvents: {
			'sort':'render',
			'add':'updateOrder',
		},
		childEvents: {
			'request:collection': 'triggerEditModal'
		},
		initialize: function() {
			this.template = _.template(App.Templates[14]);
			this.entity = this.model.get('mode') === 'ships'? 
				Entities.ships : Entities.orders;
		},
		onBeforeAddChild: function(child) {
			child.mode = this.model.get('mode');
			child.status = this.model.get('status');
		},
		triggerEditModal: function(child) {
			this.triggerMethod('render:editModal',child.model,this.collection,1);
		},
		sortHandler: function(e) {
			var prop = $(e.target).attr('data-sort'),
				model = this.model;
			this.collection.comparator = function(door) {
				var price = Entities.doorsStock.findWhere({
					id: door.get('id')
				}).get('price');
				return model.get(prop) ?
					-price*door.get('order').quantity:
					price*door.get('order').quantity;
			};
			model.get(prop) ? model.set(prop,''):model.set(prop,'up');
			this.collection.sort();
		},
		approveHandler: function() {
			this.triggerMethod('approve:order',this.model.get('orderId'));
		},
		cancelHandler: function() {
			this.triggerMethod('remove:order',this.model.get('orderId'));
		},
		updateOrder: function() {
			var model = this.entity.findWhere({id: this.model.get('orderId')});
			var sum = 0;
			model.get('doors').each(function(door) {
				var price = Entities.doorsStock.findWhere({
					id: door.get('id')
				}).get('price');
				sum += door.get('order').quantity*price;
			});
			model.set({'total':sum,'doors':this.collection});
			model.save();
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