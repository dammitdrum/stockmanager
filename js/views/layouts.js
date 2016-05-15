define([
	'marionette',
	'app',
	'views/modalViews',
	'entities',
	'views/stockViews',
	'views/ordersViews',
	'backboneSearch'
],function(Marionette, App, modalViews, Entities, stockViews, ordersViews){

	var stockLayout = Marionette.LayoutView.extend({
		el: '#content',
		regions: {
			filtersRegion: "#filters_region",
			tableRegion: "#table_region",
			footerRegion: "#footer_region",
			titleRegion: "#title"
		},
		childEvents: {
			'render:detailModal':'renderDetailModal',
			'render:addModal':'renderAddModal',
			'search:doors':'renderSearchResult',
			'filter:doors':'renderFilterResult',
			'submit:order':'renderSendMess'
		},
		initialize: function() {
			this.template = _.template(App.Templates[0]);
			this.doorsResult = Entities.doorsStock;
		},
		onRender: function() {
			this.addRegions({
				modalRegion: "#stockModal",
				addModalRegion: "#addModal"
			})
		},
		renderDetailModal: function(child, door) {
			var modal = new modalViews.Detail({ 
				model: door
			});
			this.showChildView('modalRegion',modal);
		},
		renderAddModal: function(child, door) {
			var modal = new modalViews.Add({ 
				model: door
			});
			this.showChildView('addModalRegion',modal);
		},
		renderSearchResult: function(child, query) {
			if (query.length === 0) {
				this.renderList(this.doorsResult);
				return;
			};
			var results = this.doorsResult.search(query,['name','art']);
			this.renderList(results,query);
		},
		renderFilterResult: function(child, filterMap) {
			var results = Entities.doorsStock,
				self = this;
			filterMap.each(function(filter) {
				results = self.filtering(results,filter);
			});
			this.doorsResult = results;
			this.renderList(this.doorsResult);
		},
		renderSendMess: function(child,param) {
			var sendV = new stockViews.sendOrder();
			this.showChildView('tableRegion',sendV);
			this.getRegion('footerRegion').empty();
		},
		filtering: function(filtered,filter) {
			var arr_hash = [];
			var result = new Entities.collection();
			filter.get('list').each(function(val) {
				var hash = {};
				if (val.get('active')) {
					hash[filter.get('code')] = val.get('name');
					arr_hash.push(hash);
				}
			});
			_.each(arr_hash,function(hash) {
				result.add(filtered.where(hash));
			});
			return arr_hash.length ? result : filtered;
		},
		renderList: function(doors,query) {
			if (doors.length) {
				var doorsV = new stockViews.stockList({
					collection: doors
				});
			} else {
				if (typeof query !== 'undefined') {
					var doorsV = new stockViews.emptyResult({
						model: new Entities.model({
							query: query
						})
					}); 
				} else {
					var doorsV = new stockViews.emptyResult();
				};	
			};
			this.showChildView('tableRegion',doorsV);
		}
	});

	var ordersLayout = Marionette.LayoutView.extend({
		el: '#content',
		regions: {
			ordersRegion: "#orders_region",
			filtersRegion: "#filters_region",
			footerRegion: "#footer"
		},
		childEvents: {
			'render:detailModal':'renderDetailModal',
			'show:detail':'showDetail',
			'search:orders':'renderSearchResult',
			'filter:period':'renderPeriodResult',
			'set:tab':'changeTab',
			'get:moreOrders':'getMoreOrders'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[16]);
			this.page = opt.page;
		},
		onRender: function() {
			var self = this;
			this.addRegions({
				orderDetailRegion: "#order_detail",
				modalRegion: "#stockModal"
			});
			this.navPage = 1;
			if (this.page === 'homePage') {
				this.showPreload();
				Entities.orders.fetch().then(function() {
	            	self.renderList(Entities.orders,false);
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
			var status = 'new',
				self = this;
			this.complete = false;
			this.navPage = 1;
			if(tab==1) {
				status = 'history';
				this.complete = true;
			};
			this.getRegion('orderDetailRegion').empty();
			this.showPreload();
			Entities.orders.fetch({
				data: { filter: {status: [status]},nav: 'page-'+self.navPage }
			}).then(function() {
				self.renderList(Entities.orders,tab==1?true:false)
			});
		},
		renderDetailModal: function(child, door) {
			var modal = new modalViews.Detail({ 
				model: door
			});
			this.showChildView('modalRegion',modal);
		},
		renderSearchResult: function(child, query) {
			if (query.length === 0) {
				this.renderList(Entities.orders,true);
				return;
			};
			var results = Entities.orders.search(query,['id']);
			this.renderList(results,true,'undefined',query);
		},
		renderPeriodResult: function(child, filter) {
            var status = filter.complete ? 'history':'new',
            	self = this;

            this.navPage = 1;
            var dataFilt = {
            	filter: {
            		date:[filter.from, filter.to],
            		status: [status]
            	},
            	nav: 'page-'+this.navPage
            };
            this.complete = filter.complete;
            this.showPreload();
            Entities.orders.fetch({data: dataFilt}).then(function() {
            	self.renderList(Entities.orders,filter.complete);
            });
		},
		getMoreOrders: function(child,param) {
			var self = this,
				status = this.complete ? 'history':'new',
				nav = true;

			this.navPage++;
            var dataFilt = {
            	filter: {
            		status: [status]
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
				self.renderList(Entities.orders,self.complete,nav)
            });
		},
		renderList: function(result,complete,nav,query) {
			if (result.length) {
				if (typeof nav === 'undefined') {
					var nav = result.length%12 !== 0 ? false:true;
				};
				var orders = new ordersViews.orders({
					model: new Entities.model({'complete':complete,'nav':nav}),
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
		showDetail: function(child, doors) {
			var el = child.$el,
				region = this.getRegion('orderDetailRegion').$el,
				self = this;

			region.removeClass('fade');
			if (!child.stop) {
				child.stop = true;
				if (el.hasClass('active')) {
					var order = new ordersViews.ordersDetail({
						collection: doors
					});
					if (region.height()>0) {
						region.addClass('fade').slideUp(300,function() {
							$('html, body').animate({ scrollTop: el.offset().top }, 300);
							self.setPosDOM(el,region);
							self.showChildView('orderDetailRegion',order);
							region.removeClass('fade').hide().slideDown(300,function() {child.stop = false});
						});
					} else {
						$('html, body').animate({ scrollTop: el.offset().top }, 400);
						self.setPosDOM(el,region);
						self.showChildView('orderDetailRegion',order);
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

	return {
		stockLayout: stockLayout,
		ordersLayout: ordersLayout
	}

})