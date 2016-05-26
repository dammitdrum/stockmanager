// ui_scrollTop global

define(['marionette','app','entities','moment'],function(Marionette,App,Entities,moment){

	var stockFooterView = Marionette.ItemView.extend({
		className: 'top clearfix',
		ui: {
			but: '.js_order'
		},
		events: {
			'click @ui.but': 'goToOrder'
		},
		collectionEvents: {
			'all': 'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[8]);
		},
		serializeData: function() {
			var total = 0;
			if(this.collection.length>0) {
				this.collection.each(function(model) {
					total += model.get('price')*model.get('order').quantity;
				});
			}
			return {
				quantity: this.collection.length, 
				total: total,
				role: App.user.get('role')
			};
		},
		goToOrder: function() {
			if (this.collection.length === 0) return;
			Entities.markets.fetch().then(function() {
				App.navigate('stock/order',{trigger:true});
			});
		}
	});

	var orderFooterView = Marionette.ItemView.extend({
		className: 'top clearfix',
		ui: {
			but: '.js_submit',
			select: '.js_manager',
			comment: '.js_comment'
		},
		events: {
			'click @ui.but': 'submitOrder',
			'change @ui.comment': 'saveComment'
		},
		collectionEvents: {
			'add remove': 'render'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[11]);
			var self = this;
			this.managers = opt.managers;
			this.stopSubmit = false;
			this.comment = '';
		},
		onRender: function() {
			this.ui.comment.val(this.comment);
		},
		serializeData: function() {
			var total = 0;
			if(this.collection.length>0) {
				this.collection.each(function(model) {
					total += model.get('price')*model.get('order').quantity;
				});
			};
			return {
				quantity: this.collection.length, 
				total: total,
				role: App.user.get('role'),
				managers: this.managers
			};
		},
		saveComment: function() {
			this.comment = this.ui.comment.val();
		},
		submitOrder: function() {
			if (!this.collection.length||this.stopSubmit) return;
			var data = [],
				comment = null,
				role = App.user.get('role'),
				manager = role === 'manager'? App.user.get('name') : null,
				entity = role !== 'mogilev' ? Entities.orders : Entities.ships,
				status = role !== 'mogilev' ? 'new' : 'approved',
				newOrder = new Entities.orderModel(),
				doors = new Entities.collection(),
				id = entity.length ? +entity.at(0).get('id')+1 : 1;

			this.stopSubmit = true;
			
			if (this.ui.select.length) {
				manager = this.ui.select.find('option:selected').text();
			};
			if (this.ui.comment.length) {
				comment = this.ui.comment.val();
			};

			this.collection.each(function(door) {
				var order = new Entities.model();
				order.set({
					'id': door.get('id'),
					'order': door.get('order')
				});
				doors.add(order);
			})

			newOrder.set({
				'id': id,
				'comment': comment,
				'date': moment().format('DD.MM.YY'),
				'status': status,
				'object': manager,
				'doors': doors
			})

			entity.add(newOrder);
			newOrder.save();

			this.collection.each(function(model) {
        		model.unset('order',{silent: true});
        	});

        	this.collection.reset();
            this.triggerMethod('submit:order');
            this.stopSubmit = false;
		}
	});

	var footerView = Marionette.ItemView.extend({
		className: 'wrap',
		initialize: function() {
			this.template = _.template(App.Templates[18]);
		},
		onDomRefresh: function() {
			ui_scrollTop();
		}
	});

	return {
		stockFooter: stockFooterView,
		orderFooter: orderFooterView,
		footer: footerView
	}

})