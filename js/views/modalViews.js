define(['marionette','app','entyties'],function(Marionette,App,Entyties){

	var Detail = Marionette.ItemView.extend({
		className: 'modal-dialog stockModal',
		initialize: function() {
			this.template = _.template(App.Templates[6]);
		},
	});

	var Add = Marionette.ItemView.extend({
		className: 'modal-dialog addModal',
		ui: {
			ctrl: '.js_ctrl',
			num: '.js_num',
			comment: '.js_comment',
			total: '.js_total',
			add: '.js_add',
			del: '.js_del'
		},
		events: {
			'click @ui.ctrl': 'changeQuant',
			'click @ui.add': 'addToOrder',
			'click @ui.del': 'delFromOrder',
			'change @ui.comment': 'setComment'
		},
		initialize: function() {
			this.template = _.template(App.Templates[7]);
			this.order = this.model.get('order') || {'quantity': 1,'comment': ''};
		},
		serializeData: function() {
			var order = this.order;
			return {
				quantity: order.quantity, 
				comment: order.comment,
				price: this.model.get('price')
			};
		},
		changeQuant: function(e) {
			var n = this.ui.num.val();
			$(e.target).hasClass('up') ? n++ : n--;
			if (n === 0) n = 1; 
			this.ui.num.val(n);
			this.order.quantity = n;
			this.ui.total.html( String(this.model.get('price')*n)
				.replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1&nbsp;') );
		},
		setComment: function(e) {
			this.order.comment = $(e.target).val();
		},
		addToOrder: function() {
			Entyties.orderCollection.remove(this.model);
			this.model.set({'order': this.order});
			Entyties.orderCollection.add(this.model);
						
		},
		delFromOrder: function() {
			Entyties.orderCollection.remove(this.model);
			this.model.unset('order');
		}
	});

	return {
		Detail: Detail,
		Add: Add
	}

})