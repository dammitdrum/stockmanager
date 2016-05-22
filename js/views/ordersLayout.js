define([
	'marionette',
	'app',
	'views/modalViews',
	'entities',
	'views/ordersViews',
	'views/shipsViews',
	'moment'
],function(Marionette, App, modalViews, Entities, ordersViews, shipsViews, moment){

	return Marionette.LayoutView.extend({
		el: '#content',
		regions: {
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
			this.mode = opt.mode;
		},
		onRender: function() {
			this.entity = this.mode === 'ships'? Entities.ships : Entities.orders;
			var self = this;
			this.addRegions({
				ordersRegion: "#orders_region",
				orderDetailRegion: "#order_detail",
				modalRegion: "#stockModal",
				editModalRegion: "#editModal"
			});
			this.navPage = 1;
			this.dataFilt = {
            	filter: {
            		status: this.status,
            	}
            };
            if (this.page === 'homePage'&&
            		!(App.user.get('role')==='sklad')) {
            	this.showPreload();
				this.entity.fetch({data: self.dataFilt}).then(function() {
	            	self.renderList(self.entity,self.status);
	            });
            };
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

			this.entity.fetch({
				data: { filter: {status: self.status}}
			}).then(function() {
				self.renderList(self.entity,self.status)
			});
		},
		renderDetailModal: function(child, door) {
			var modal = new modalViews.Detail({ 
				model: door
			});
			this.showChildView('modalRegion',modal);
		},
		renderEditModal: function(child, door, doors, changed) {
			var modal = new modalViews.Add({ 
				model: door,
				collection: doors,
				edit: true,
				changed: changed
			});
			this.showChildView('editModalRegion',modal);
		},
		removeOrder: function(child,id) {
			this.refreshOrders('canceled',id);
		},
		approveOrder: function(child,id) {
			var status = App.user.get('role') !== 'sklad'?'approved':'history';
			this.refreshOrders(status,id);
		},
		refreshOrders: function(status,id) {
			var self = this;
			var data = {
				status: status,
				id: id
			};
			var url = this.model.get('mode') === 'orders' ?'orders':'ships';
            $.ajax({
				url: '/request/sklad/?component=sklad:'+url,
				type: "PUT",
				data: JSON.stringify(data),
				success: function() {
					self.showPreload();
		            self.entity.fetch({data: self.dataFilt}).then(function() {
		            	self.renderList(self.entity,self.status);
		            	Entities.doorsStock.fetch();
		            });
				}
			});
		},
		rerenderOrder: function(child, data) {

			var model = new Entities.model(data[0]);
			var doors = new Entities.collection(model.get('doors'));
			console.log(data);
			model.set('doors',doors);
			this.entity.set(model,{remove:false});
		},
		renderSearchResult: function(child, query) {
	        var self = this;
            this.dataFilt.filter.status = this.status;
            this.dataFilt.filter.id = query;
            this.entity.fetch({data: this.dataFilt}).then(function() {
            	self.renderList(self.entity,self.status);
            });
		},
		renderFilterResult: function(child, filter) {
			var self = this;

            this.navPage = 1;
            this.dataFilt = {
            	filter: {
            		date:[filter.from, filter.to],
            		status: filter.status,
            		managers: filter.managers
            	}
            };
            this.status = filter.status;
            this.showPreload();
            this.entity.fetch({data: this.dataFilt}).then(function() {
            	self.renderList(self.entity,filter.status);
            });
		},
		getMoreOrders: function(child,param) {
			var self = this,
				nav = true;

			this.navPage++;
            this.dataFilt = {
            	filter: {
            		status: this.status
            	},
            	nav: 'page-'+this.navPage
            };
			this.entity.fetch({
				data: self.dataFilt,
				remove: false,
				success: function(coll,response) {
					nav = coll.length%12 !== 0 || response === null ?
						false : true; 
				}
			}).then(function() {
				self.renderList(self.entity,self.status,nav)
            });
		},
		renderList: function(result,status,nav,query) {
			if (result.length) {
				if (typeof nav === 'undefined') {
					var nav = result.length%12 !== 0 ? false:true;
				};
				var View = this.mode ==="ships" ? shipsViews.ships : ordersViews.orders;
				var orders = new View({
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
							'orderId': order.get('id'),
							'mode': this.mode
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