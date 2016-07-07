define(['marionette','app','entities'],function(Marionette,App,Entities){

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
		initialize: function(opt) {
			this.template = _.template(App.Templates[7]);
			this.order = this.model.get('order') || {'quantity': 1,'comment': ''};
			this.editMode = opt.edit;
			this.changed = opt.changed;
			this.price = Entities.doorsStock.findWhere({
				id: this.model.get('id')
			}).get('price');
			this.mode = opt.mode;
			this.status = opt.status;
		},
		onRender: function() {
			this.old_q = this.order.quantity;
		},
		serializeData: function() {
			var order = this.order;
			return {
				quantity: order.quantity, 
				comment: order.comment,
				price: this.price,
				edit: this.editMode,
				role: App.user.get('role')
			};
		},
		changeQuant: function(e) {
			var n = this.ui.num.val();
			$(e.target).hasClass('up') ? n++ : n--;
			if (n === 0) n = 1; 
			this.ui.num.val(n);
			this.order.quantity = n;
			this.ui.total.html( String(this.price*n)
				.replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1&nbsp;') );
		},
		setComment: function(e) {
			this.order.comment = $(e.target).val();
		},
		addToOrder: function() {
			if (this.changed) {
				this.order.changed = 1;
			}
			var checkStatus = _.find(this.status,function(str) {
				return str === 'approved'
			});
			if (this.editMode&&this.mode==='orders'&&checkStatus) {
				var stockDoor = Entities.doorsStock.findWhere({
					id: this.model.get('id')
				});
				var n = stockDoor.get('quantity_reserved') - this.old_q + this.order.quantity;
				stockDoor.set('quantity_reserved',n).save();
			};
			this.collection.remove(this.model);
			this.model.set({'order': this.order});
			this.collection.add(this.model);
		},
		delFromOrder: function() {
			this.collection.remove(this.model);
			this.model.unset('order');
		}
	});

	var EditPrice = Marionette.ItemView.extend({
		className: 'modal-dialog addModal editPrice',
		ui: {
			input: '.js_price',
			but: '.js_set_price'
		},
		events: {
			'click @ui.but': 'setPrice',
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[21]);
		},
		setPrice: function() {
			this.model.set({'price': +this.ui.input.val().trim()});
			if (this.model.get('order')) {
				this.collection.set(this.model,{remove:false})
			}
			this.model.save();
		}
	});

	return {
		Detail: Detail,
		Add: Add,
		Price: EditPrice
	}

})