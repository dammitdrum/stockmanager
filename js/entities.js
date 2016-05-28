	
define(['backbone','lib/backbone.localStorage'],function(Backbone){

	var storageOrders = new Backbone.LocalStorage('orders');
	var storageShips = new Backbone.LocalStorage('ships');
	var doorsStorage = new Backbone.LocalStorage('doors');
	var userStorage = new Backbone.LocalStorage('user');

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

	var OrdersCollection = Backbone.Collection.extend({
		model: OrdersModel,
		//url: 'js/json/orders.json',
		localStorage: storageOrders,
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var ShipsCollection = Backbone.Collection.extend({
		model: OrdersModel,
		//url: 'js/json/ships.json',
		localStorage: storageShips,
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var profileModel = Backbone.Model.extend({
		defaults: function() {
			return {
				name: "Фирменный салон «Стальная линия»",
				city: "Минск",
				index: "220100",
				address: "ТЦ Трюм, ул. Кальварийская, 7Б-6",
				ur_address: "ТЦ Трюм, ул. Кальварийская, 7Б-6",
				main_name: "Васек",
				phone: "1234678",
				email: "asdsdsdasd@ya.ru",
				fio: "Пупкин Вася Федотович",
				role: "admin"
			}
		},
		localStorage: userStorage
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
