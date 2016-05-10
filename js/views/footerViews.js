// ui_scrollTop global

define(['marionette','app'],function(Marionette,App){

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
			'add remove': 'render'
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
			console.log(this.collection.toJSON());
			
			var xhr = new XMLHttpRequest();

		    xhr.open('POST', '?action=add&component=sklad.orders', true);
		    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		    xhr.send({DATA:[{id:1,quantity:4,comment:'first'}, {id:3,quantity:2,comment:'second'}]}); 
		    
		    xhr.onreadystatechange = function() { 
				if (xhr.readyState != 4) return;
				if (xhr.status != 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					console.log(xhr.responseText);
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