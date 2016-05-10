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
			this.renderList(results);
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
		renderList: function(doors) {
			var doorsV = new stockViews.stockList({
				collection: doors
			});
			this.showChildView('tableRegion',doorsV);
		}
	});

	var homeLayout = Marionette.LayoutView.extend({
		el: '#content',
		regions: {
			ordersRegion: "#orders_preview",
			historyRegion: "#history_preview",
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
			'order:active':'lookActiveEl',
		},
		initialize: function() {
			this.template = _.template(App.Templates[12]);
		},
		onRender: function() {
			this.addRegions({
				orderDetailRegion: "#order_detail",
				modalRegion: "#stockModal"
			})
		},
		lookActiveEl: function(child,el) {
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
		showDetail: function(child, doors) {
			var el = child.$el;
			if(el.hasClass('active')) {
				var order = new ordersViews.ordersDetail({
					collection: doors
				});
				this.showChildView('orderDetailRegion',order);
				if(el.hasClass('after')) {
					el.after(this.getRegion('orderDetailRegion').$el);
					return;
				}
				var next = el.next();
				while (!next.hasClass('after')) {
					next = next.next();
				};
				next.after(this.getRegion('orderDetailRegion').$el);
			} else {
				this.getRegion('orderDetailRegion').empty();
			}
			
		}
	});

	var ordersLayout = Marionette.LayoutView.extend({
		el: '#content',
		regions: {
			ordersRegion: "#orders_preview",
			filtersRegion: "#filters_region",
			footerRegion: "#footer"
		},
		childEvents: {
			'render:detailModal':'renderDetailModal',
			'show:detail':'showDetail',
			'search:orders':'renderSearchResult',
			'filter:period':'renderPeriodResult'
		},
		initialize: function() {
			this.template = _.template(App.Templates[16]);
		},
		onRender: function() {
			this.addRegions({
				orderDetailRegion: "#order_detail",
				modalRegion: "#stockModal"
			})
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
			this.renderList(results,true);
		},
		showDetail: function(child, doors) {
			var el = child.$el,
				region = this.getRegion('orderDetailRegion').$el;

			if (el.hasClass('active')) {
				var order = new ordersViews.ordersDetail({
					collection: doors
				});
				this.showChildView('orderDetailRegion',order);
				region.hide().slideDown(300);
				if(el.hasClass('after')) {
					el.after(region);
					return;
				}
				var next = el.next();
				while (!next.hasClass('after')) {
					next = next.next();
				};
				next.after(region);
				
			} else {
				region.slideUp(300);
			}
			
		},
		renderPeriodResult: function(child, filter) {
			console.log(filter);
		},
		renderList: function(result,complite) {
			var orders = new ordersViews.orders({
				model: new Entyties.model({'complite':complite}),
				collection: result
			});
			this.showChildView('ordersRegion',orders);
		}
	});

	return {
		stockLayout: stockLayout,
		homeLayout: homeLayout,
		ordersLayout: ordersLayout
	}

})