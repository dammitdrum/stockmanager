// ui_scrollTop global

define(['marionette','app','entities','backbone'],function(Marionette,App,Entities){

	var stockFooterView = Marionette.ItemView.extend({
		className: 'top clearfix',
		ui: {
			but: '.js_order'
		},
		events: {
			'click @ui.but': 'goToOrder'
		},
		collectionEvents: {
			'add remove': 'render'
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
			App.navigate('stock/order',{trigger:true});
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
			'click @ui.but': 'submitOrder'
		},
		collectionEvents: {
			'add remove reset': 'render'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[11]);
			var self = this;
			this.managers = opt.managers;
			this.stopSubmit = false;
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
		submitOrder: function() {
			if (!this.collection.length||this.stopSubmit) return;
			var data = [],
				self = this,
				role = App.user.get('role');
			
			this.stopSubmit = true;
			this.collection.each(function(model) {
				var obj = {};
				obj.id = model.get('id');
				obj.quantity = model.get('order').quantity;
				obj.comment = model.get('order').comment;
				data.push(obj);
			});
			if (this.ui.select.length) {
				var manager = this.ui.select.find('option:selected').val();
			};
			if (this.ui.comment.length) {
				var comment = this.ui.comment.val();
			};
			
			var url = role !== 'mogilev' ?'orders':'ships';
			var entity = role !== 'mogilev' ? Entities.orders : Entities.ships;
            $.ajax({
				url: '/request/sklad/?component=sklad:'+url,
				type: "POST",
				data: JSON.stringify({
					data: data, 
					manager: manager, 
					comment: comment,
					doc_type: 'A'
				}),
				success: function() {
					self.collection.each(function(model) {
                		model.unset('order',{silent: true});
                	});
                	self.collection.reset();
                    self.triggerMethod('submit:order',self.collection.length);
                    entity.fetch();
                    self.stopSubmit = false;
				}
			});
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