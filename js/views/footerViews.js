// ui_scrollTop global

define(['marionette','app','entities'],function(Marionette,App,Entities){

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
		onRender: function() {
			ui_scrollTop();
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
				total: total
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
			but: '.js_submit'
		},
		events: {
			'click @ui.but': 'submitOrder'
		},
		collectionEvents: {
			'add remove reset': 'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[11]);
		},
		onRender: function() {
			ui_scrollTop();
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
				total: total
			};
		},
		submitOrder: function() {
			if (!this.collection.length) return;
			var data = [],
				self = this;
			
			this.collection.each(function(model) {
				var obj = {};
				obj.id = model.get('id');
				obj.quantity = model.get('order').quantity;
				obj.comment = model.get('order').comment;
				data.push(obj);
			});

			var xhr = new XMLHttpRequest();
		    xhr.open('POST', '/request/sklad/?component=sklad:orders', true);
		    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		    xhr.send(JSON.stringify({data: data}));
		    xhr.onreadystatechange = function () { // (2)
                if (xhr.readyState != 4) return;
                if (xhr.status = 200) {
                	self.collection.each(function(model) {
                		model.unset('order',{silent: true});
                	});
                	self.collection.reset();
                    self.triggerMethod('submit:order',self.collection.length);
                    Entities.orders.fetch();
                }

            }
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