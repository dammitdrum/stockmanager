define(['marionette','app','entities'],function(Marionette,App,Entities){	

	var shipItem = Marionette.ItemView.extend({
		className: 'box ship',
		events: {
			'click':'select'
		},
		modelEvents: {
			'change':'render'
		},
		initialize: function() {
			this.template = _.template(App.Templates[22]);
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
	

	var shipsView = Marionette.CollectionView.extend({
		childView: shipItem,
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
			if(this.count%2 === 0) {
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
	
	return {
		ships: shipsView
	}
})