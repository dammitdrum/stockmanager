define(['marionette','app','entities'],function(Marionette,App,Entities){

	
	var orderItem = Marionette.ItemView.extend({
		className: 'box',
		ui: {
			
		},
		events: {
			'click':'select'
		},
		modelEvents: {
			'change':'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[13]);
			this.stop = false;
		},
		select: function() {
			this.triggerMethod('show:detail',this.model,this.stop);
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
			'remove':'render'
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
		},
		serializeData: function() {
			var obj = this.model.toJSON();
			obj["role"] = App.user.get('role');
			return obj;
		},
		showModal: function(e) {
			if ($(e.target).hasClass('js_to_edit')) {
				this.triggerMethod('request:collection');
			} else {
				this.triggerMethod('render:detailModal',this.model);
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
			'add':'saveOrder'
		},
		childEvents: {
			'request:collection': 'triggerEditModal'
		},
		initialize: function() {
			this.template = _.template(App.Templates[14]);
		},
		triggerEditModal: function(child) {
			this.triggerMethod('render:editModal',child.model,this.collection);
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
		},
		approveHandler: function() {
			this.triggerMethod('approve:order',this.model.get('orderId'));
		},
		cancelHandler: function() {
			this.triggerMethod('remove:order',this.model.get('orderId'));
		},
		saveOrder: function() {
			var arr = [],
				self = this;
			this.collection.each(function(door) {
				door = {
					id: door.get('id'),
					quantity: door.get('order').quantity,
					comment: door.get('order').comment
				};
				arr.push(door);
			});
			var data = {
				id: this.model.get('orderId'),
				data: arr
			};
            $.ajax({
				url: '/request/sklad/?component=sklad:orders',
				type: "PUT",
				data: JSON.stringify(data),
				success: function(res) {
					self.triggerMethod('rerender:order',JSON.parse(res));
				}
			});
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