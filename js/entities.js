	
define(['backbone'],function(Backbone){

	var Model = Backbone.Model.extend({
		
	});

	var Collection = Backbone.Collection.extend({
		model: Model,
	});

	var CollectionDoors = Backbone.Collection.extend({
		model: Model,
		url: 'js/json/doors.json'
	});

	var FilterModel = Backbone.Model.extend({
		parse: function(response) {
		    response.list = new Collection(response.list);
		    return response;
		},
	});

	var FilterCollection = Backbone.Collection.extend({
		model: FilterModel,
		url: 'js/json/filters.json'
	});

	var Markets = Backbone.Collection.extend({
		model: FilterModel,
		url: 'js/json/markets.json'
	});

	var OrdersModel = Backbone.Model.extend({
		parse: function(response) {
		    response.doors = new Collection(response.doors);
		    return response;
		},
	});

	var Orders = Backbone.Collection.extend({
		model: OrdersModel
	});

	var OrdersCollection = Backbone.Collection.extend({
		model: OrdersModel,
		url: 'js/json/orders.json',
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var ShipsCollection = Backbone.Collection.extend({
		model: OrdersModel,
		url: 'js/json/ships.json',
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var profileModel = Backbone.Model.extend({
		url: 'js/json/user.json',
	});

	var quantityModel = Backbone.Model.extend({
		defaults: {
			orders: 12,
			ships: 7
		}
	})
	
	return {
		model: Model,
		collection: Collection,
		filtersStock: FilterCollection,
		doorsStock: new CollectionDoors(),
		orderCollection: new Collection(),
		orders: new OrdersCollection(),
		ships: new ShipsCollection(),
		ordersCollection: Orders,
		profile: profileModel,
		markets: Markets,
		quant: quantityModel
	}

})
