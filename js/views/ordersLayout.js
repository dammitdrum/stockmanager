define([
	'marionette',
	'app',
	'views/modalViews',
	'entities',
	'views/ordersViews',
	'views/shipsViews',
	'moment',
	'backboneSearch'
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
			this.entityFiltered = this.entity;//for searching
			this.addRegions({
				ordersRegion: "#orders_region",
				orderDetailRegion: "#order_detail",
				modalRegion: "#stockModal",
				editModalRegion: "#editModal"
			});
			if (this.page==='homePage'&&App.user.get('role')!=='sklad') {
				this.renderList(this.entity,this.status);
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
					this.status = ['history','canceled'];
					break;
			};
			this.getRegion('orderDetailRegion').empty();
        	this.renderList(this.entity,this.status);
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
			this.entity.findWhere({id: id}).set('status','canceled').save();
			if (this.mode !== 'ships' && this.status[0] !== 'new') {
				this.changeQuantities(this.entity.findWhere({id: id}),'cancelQuantity');
			};
			this.renderList(this.entity,this.status);
		},
		approveOrder: function(child,id) {
			var status = App.user.get('role') !== 'sklad'?'approved':'history';
			this.entity.findWhere({id: id}).set('status',status).save();

			if (this.status[0] === 'new') {
				var type = 'setQuantity'
			} else {
				var type = this.mode === 'ships' ? 
					'addQuantity' : 'removeQuantity';
			};
			this.changeQuantities(this.entity.findWhere({id: id}),type);

			this.renderList(this.entity,this.status);
		},
		changeQuantities: function(order,type) {

			order.get('doors').each(function(door) {
					
				var stockDoor = Entities.doorsStock.findWhere({
						id: door.get('id')
					}),
					stockQ = stockDoor.get('quantity'),
					orderQ = door.get('order').quantity,
					reservQ = stockDoor.get('quantity_reserved');

				switch(type) {
					case 'addQuantity':
						var q = stockQ + orderQ,
							r = reservQ;
						break;
					case 'removeQuantity':
						var q = stockQ - orderQ,
							r = reservQ - orderQ;
						break;
					case 'cancelQuantity':
						var q = stockQ,
							r = reservQ - orderQ;
						break;
					case 'setQuantity':
						var q = stockQ,
							r = reservQ + orderQ;
						break;
				}

				stockDoor.set({
					'quantity': q,
					'quantity_reserved': r
				})
				stockDoor.save();
			})
		},
		renderSearchResult: function(child, query) {
            if (query.length === 0) {
				this.renderList(this.entity,this.status);
				return;
			};
			var results = this.entityFiltered.search(query,['id']);
			this.renderList(results,this.status);
		},
		renderFilterResult: function(child, filter) {
			var filtDateEntity = new Entities.collection();
			var filtMarketEntity = new Entities.collection();

        	this.entity.each(function(model) {
            	var check = moment(model.get('date'),'DD.MM.YY').isBetween(
	            	moment(filter.from,'DD.MM.YY').format('YYYY-MM-DD'), 
	            	moment(filter.to,'DD.MM.YY').format('YYYY-MM-DD'),
	            	null, '[]'
	            );
	            if (check) {
	            	filtDateEntity.add(model);
	            };
            });

            if (filter.markets.length) {
	            var arr_hash = [];
	            for (var i = 0; i < filter.markets.length; i++) {
	            	var hash = {};
					hash['object'] = filter.markets[i];
					arr_hash.push(hash);
	            };
				_.each(arr_hash,function(hash) {
					filtMarketEntity.add(filtDateEntity.where(hash));
				});
				this.renderList(filtMarketEntity,this.status);
				this.entityFiltered = filtMarketEntity;
				return;
			};
            this.renderList(filtDateEntity,this.status);
            this.entityFiltered = filtDateEntity;
		},
		renderList: function(result,status,query) {
			var filtResult = new Entities.collection();

			if (result.length) {
				for (var i = 0; i < status.length; i++) {
					 filtResult.add(result.where({status: status[i]}));
				};
				var View = this.mode ==="ships" ? shipsViews.ships : ordersViews.orders;
				filtResult.comparator = function(model) {
					return -model.get('id');
				};
				filtResult.sort();
				var orders = new View({
					model: new Entities.model({'status':status}),
					collection: filtResult
				});
			} 
			if (filtResult.length === 0) {
				var orders = new ordersViews.emptyResult({
					model: new Entities.model({
						'query': query
					})
				});
			};
			this.showChildView('ordersRegion',orders);
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