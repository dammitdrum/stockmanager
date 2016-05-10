define([
	'marionette',
	'app',
	'views/modalViews',
	'entyties',
	'views/stockViews',
	'views/ordersViews',
	'backboneSearch'
],function(Marionette, App, modalViews, Entyties, stockViews, ordersViews){

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
		},
		initialize: function() {
			this.template = _.template(App.Templates[0]);
			this.doorsResult = Entyties.doorsStock;
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
			var results = Entyties.doorsStock,
				self = this;
			filterMap.each(function(filter) {
				results = self.filtering(results,filter);
			});
			this.doorsResult = results;
			this.renderList(this.doorsResult);
		},
		filtering: function(filtered,filter) {
			var arr_hash = [];
			var result = new Entyties.collection();
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
						model: new Entyties.model({
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
			ordersPreviewRegion: "#orders_preview",
			historyPreviewRegion: "#history_preview",
			footerRegion: "#footer"
		},
		ui: {
			tabs: '[data-tab]',
			screens: '.js_screen_tab'
		},
		events: {
			'click @ui.tabs': 'setTab'
		},
		childEvents: {
			'render:detailModal':'renderDetailModal',
			'show:detail':'showDetail',
			'search:orders':'renderSearchResult',
			'filter:period':'renderPeriodResult',
			'order:active':'lastActiveEl',
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[16]);
			this.home = opt.page;
		},
		onRender: function() {
			this.addRegions({
				orderDetailRegion: "#order_detail",
				modalRegion: "#stockModal"
			})
		},
		serializeData: function() {
			return {
				page: this.home,
				title: this.model.get('title')
			};
		},
		lastActiveEl: function(child,el) {
			this.elem = el;
		},
		setTab: function(e) {
			if($(e.target).hasClass('active')) return;
			this.ui.tabs.removeClass('active');
			$(e.target).addClass('active');
			this.ui.screens.removeClass('active')
				.eq($(e.target).attr('data-tab')).addClass('active');

			this.getRegion('orderDetailRegion').empty();
			this.elem ? this.elem.removeClass('active'):'';
		},
		renderDetailModal: function(child, door) {
			var modal = new modalViews.Detail({ 
				model: door
			});
			this.showChildView('modalRegion',modal);
		},
		renderSearchResult: function(child, query) {
			if (query.length === 0) {
				this.renderList(Entyties.ordersHistory,true);
				return;
			};
			var results = Entyties.ordersHistory.search(query,['id']);
			this.renderList(results,true,query);
		},
		showDetail: function(child, doors) {
			var el = child.$el,
				region = this.getRegion('orderDetailRegion').$el,
				self = this;
			if (!child.stop) {
				child.stop = true;
				if (el.hasClass('active')) {
					var order = new ordersViews.ordersDetail({
						collection: doors
					});
					if (region.height()>0) {
						region.addClass('fade').slideUp(300,function() {
							self.setPosDOM(el,region);
							self.showChildView('orderDetailRegion',order);
							region.removeClass('fade').hide().slideDown(300,function() {child.stop = false});
						});
					} else {
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
		},
		renderPeriodResult: function(child, filter) {
			/*var xhr = new XMLHttpRequest();
			var self = this;

            xhr.open('POST', '?action=get&component=sklad.orders', true);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            */
            var data = {filter: {date:[filter.from, filter.to]}};
            console.log(JSON.stringify(data));
            /*
            xhr.send(JSON.stringify(data));

            xhr.onreadystatechange = function () { 
                if (xhr.readyState != 4)
                    return;
                if (xhr.status != 200) {
                    console.log(xhr.status + ': ' + xhr.statusText);
                } else {
					var orders = new Entyties.ordersCollection(JSON.parse(xhr.responseText));
                    self.renderList(orders,filter.complite);
                }

            }*/

		},
		renderList: function(result,complite,query) {
			if (result.length) {
				var orders = new ordersViews.orders({
					model: new Entyties.model({'complite':complite}),
					collection: result
				});
			} else {
				var orders = new ordersViews.emptyResult({
					model: new Entyties.model({
						query: query
					})
				});
			};
			this.showChildView('ordersRegion',orders);
		}
	});

	return {
		stockLayout: stockLayout,
		ordersLayout: ordersLayout
	}

})