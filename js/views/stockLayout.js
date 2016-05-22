define([
	'marionette',
	'app',
	'views/modalViews',
	'entities',
	'views/stockViews',
	'backboneSearch'
],function(Marionette, App, modalViews, Entities, stockViews){

	return Marionette.LayoutView.extend({
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
			'render:priceModal':'renderPriceModal',
			'search:doors':'renderSearchResult',
			'filter:doors':'renderFilterResult',
			'submit:order':'renderSendMess'
		},
		initialize: function(opt) {
			this.template = _.template(App.Templates[0]);
			this.doorsResult = Entities.doorsStock;
			this.role = opt.role;
		},
		onRender: function() {
			ui_scrollTop();
			this.addRegions({
				modalRegion: "#stockModal",
				addModalRegion: "#addModal",
				priceModalRegion: "#priceModal"
			});
		},
		renderDetailModal: function(child, door) {
			var modal = new modalViews.Detail({ 
				model: door
			});
			this.showChildView('modalRegion',modal);
		},
		renderAddModal: function(child, door) {
			var modal = new modalViews.Add({ 
				model: door,
				collection: Entities.orderCollection
			});
			this.showChildView('addModalRegion',modal);
		},
		renderPriceModal: function(child, door) {
			var modal = new modalViews.Price({ 
				model: door
			});
			this.showChildView('priceModalRegion',modal);
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

})