define([
	'marionette',
	'app',
	'views/modalViews',
	'entities',
	'views/ordersViews',
],function(Marionette, App, modalViews, Entities, ordersViews){

	return Marionette.LayoutView.extend({
		el: '#content',
		regions: {
			ordersRegion: "#orders_region",
			filtersRegion: "#filters_region",
			footerRegion: "#footer"
		},
		childEvents: {
			'render:detailModal':'renderDetailModal',
			'render:editModal':'renderEditModal',
			'show:detail':'showDetail',
			'search:orders':'renderSearchResult',
			'filter:orders':'renderFilterResult',
			'set:tab':'changeTab',
			'get:moreOrders':'getMoreOrders',
			'rerender:order':'rerenderOrder',
			'remove:order':'removeOrder',
			'approve:order':'approveOrder'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[16]);
			this.page = opt.page;
			this.status = opt.status;
		},
		onRender: function() {
			var self = this;
			this.addRegions({
				orderDetailRegion: "#order_detail",
				modalRegion: "#stockModal",
				editModalRegion: "#editModal"
			});
			this.navPage = 1;
			if (this.page === 'homePage') {
				this.showPreload();
				Entities.orders.fetch().then(function() {
	            	self.renderList(Entities.orders,self.status);
	            });
			}
		},
		serializeData: function() {
			return {
				page: this.page,
				title: this.model.get('title')
			};
		},
		changeTab: function(child,tab) {
			var self = this;

			this.navPage = 1;

			switch(tab) {
				case '0':
					this.status = ['new'];
					break;
				case '1':
					this.status = ['approved'];
					break;
				case '2':
					this.status = ['new','approved'];
					break;
				case '3':
					this.status = ['history'];
					break;
			};

			this.getRegion('orderDetailRegion').empty();
			this.showPreload();

			Entities.orders.fetch({
				data: { filter: {status: self.status}}
			}).then(function() {
				self.renderList(Entities.orders,self.status)
			});
		},
		renderDetailModal: function(child, door) {
			var modal = new modalViews.Detail({ 
				model: door
			});
			this.showChildView('modalRegion',modal);
		},
		renderEditModal: function(child, door, doors) {
			var modal = new modalViews.Add({ 
				model: door,
				collection: doors
			});
			this.showChildView('editModalRegion',modal);
		},
		removeOrder: function(child,id) {
			Entities.orders.remove(Entities.orders.findWhere({'id':id}));
			/*$.ajax({
				url: '',
				type: "POST",
				data: data,
				success: function(res) {

				}
			});*/
		},
		approveOrder: function(child,id) {
			Entities.orders.remove(Entities.orders.findWhere({'id':id}));
			//
		},
		rerenderOrder: function(child, data) {
			var model = new Entities.model(data[0]);
			var doors = new Entities.collection(model.get('doors'));
			model.set('doors',doors);
			Entities.orders.set(model,{remove:false});
		},
		renderSearchResult: function(child, query) {
			var dataFilt = {
	            	filter: {
	            		status: this.status,
	            		id: query
	            	},
	            },
	            self = this;

            Entities.orders.fetch({data: dataFilt}).then(function() {
            	self.renderList(Entities.orders,this.status);
            });
		},
		renderFilterResult: function(child, filter) {
			var self = this;

            this.navPage = 1;
            var dataFilt = {
            	filter: {
            		date:[filter.from, filter.to],
            		status: filter.status,
            		managers: filter.managers
            	}
            };
            this.status = filter.status;
            this.showPreload();
            Entities.orders.fetch({data: dataFilt}).then(function() {
            	self.renderList(Entities.orders,filter.status);
            });
		},
		getMoreOrders: function(child,param) {
			var self = this,
				nav = true;

			this.navPage++;
            var dataFilt = {
            	filter: {
            		status: this.status
            	},
            	nav: 'page-'+this.navPage
            };
			Entities.orders.fetch({
				data: dataFilt,
				remove: false,
				success: function(coll,response) {
					nav = coll.length%12 !== 0 || response === null ?
						false : true; 
				}
			}).then(function() {
				self.renderList(Entities.orders,self.status,nav)
            });
		},
		renderList: function(result,status,nav,query) {
			if (result.length) {
				if (typeof nav === 'undefined') {
					var nav = result.length%12 !== 0 ? false:true;
				};
				var orders = new ordersViews.orders({
					model: new Entities.model({'status':status,'nav':nav}),
					collection: result
				});
			} else {
				var orders = new ordersViews.emptyResult({
					model: new Entities.model({
						'query': query
					})
				});
			};
			this.showChildView('ordersRegion',orders);
		},
		showPreload: function() {
			var preload = new ordersViews.preload();
			this.showChildView('ordersRegion',preload);
		},
		showDetail: function(child, order) {
			var el = child.$el,
				region = this.getRegion('orderDetailRegion').$el,
				self = this;

			region.removeClass('fade');
			if (!child.stop) {
				child.stop = true;
				if (el.hasClass('active')) {
					var orderV = new ordersViews.ordersDetail({
						collection: order.get('doors'),
						model: new Entities.model({
							'cost':'',
							'role': App.user.get('role'),
							'status': this.status,
							'orderId': order.get('id')
						})
					});

					if (region.height()>0) {
						region.addClass('fade').slideUp(300,function() {
							$('html, body').animate({ scrollTop: el.offset().top }, 300);
							self.setPosDOM(el,region);
							self.showChildView('orderDetailRegion',orderV);
							region.removeClass('fade').hide().slideDown(300,function() {child.stop = false});
						});
					} else {
						$('html, body').animate({ scrollTop: el.offset().top }, 400);
						self.setPosDOM(el,region);
						self.showChildView('orderDetailRegion',orderV);
						region.hide().slideDown(300,function() {child.stop = false});
					};
				} else {
					region.addClass('fade').slideUp(300, function() {child.stop = false});
				}
			}
		},
		setPosDOM: function(el,region) {
			if(el.hasClass('after')) {
				el.after(region);
			} else {
				var next = el.next();
				while (!next.hasClass('after')) {
					next = next.next();
				};
				next.after(region);
			};
		}
	});

})