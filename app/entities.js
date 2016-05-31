	
define(['backbone','lib/backbone.localStorage'],function(Backbone){

	var storageOrders = new Backbone.LocalStorage('orders');
	var storageShips = new Backbone.LocalStorage('ships');
	var doorsStorage = new Backbone.LocalStorage('doors');

	var Model = Backbone.Model.extend({
		
	});

	var Collection = Backbone.Collection.extend({
		model: Model,
	});

	var CollectionDoors = Backbone.Collection.extend({
		model: Model,
		url: 'app/json/doors.json'
	});

	var FilterModel = Backbone.Model.extend({
		parse: function(response) {
		    response.list = new Collection(response.list);
		    return response;
		},
	});

	var Markets = Backbone.Collection.extend({
		model: FilterModel,
		url: 'app/json/markets.json'
	});

	var OrdersModel = Backbone.Model.extend({
		parse: function(response) {
		    response.doors = new Collection(response.doors);
		    return response;
		},
	});

	var OrdersCollection = Backbone.Collection.extend({
		model: OrdersModel,
		localStorage: storageOrders,
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var ShipsCollection = Backbone.Collection.extend({
		model: OrdersModel,
		localStorage: storageShips,
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var profileModel = Backbone.Model.extend({
		url: 'app/json/user.json',
	});
	
	return {
		model: Model,
		collection: Collection,
		doorsStock: new CollectionDoors(),
		orderCollection: new Collection(),
		orders: new OrdersCollection(),
		ships: new ShipsCollection(),
		profile: profileModel,
		markets: new Markets(),
		orderModel: OrdersModel,
		doorsStorage: doorsStorage
	}

})
