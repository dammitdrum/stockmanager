define(['marionette','app'],function(Marionette,App){

	return Marionette.ItemView.extend({
		ui: {
			'submit': '.js_submit',
			'open': '.js_change',
			'name': '[name="name"]',
			'city': '[name="city"]',
			'index': '[name="index"]',
			'address': '[name="address"]',
			'ur_address': '[name="ur_address"]',
			'fio': '[name="fio"]',
			'phone': '[name="phone"]',
			'email': '[name="email"]',
			'field': '.modal [type="text"]'
		},
		events: {
			'click @ui.submit': 'saveProfile',
			'click @ui.open': 'getProfile',
			'change @ui.field': 'changeProfile'
		},
		initialize: function() {
			this.template = _.template(App.Templates[12]);
		},
		onDomRefresh: function() {
			ui_scrollTop();
		},
		getProfile: function() {
			this.ui.name.val(this.model.get('name'));
			this.ui.city.val(this.model.get('city'));
			this.ui.index.val(this.model.get('index'));
			this.ui.address.val(this.model.get('address'));
			this.ui.ur_address.val(this.model.get('ur_address'));
			this.ui.fio.val(this.model.get('fio'));
			this.ui.phone.val(this.model.get('phone'));
			this.ui.email.val(this.model.get('email'));
		},
		changeProfile: function(e) {
			this.model.set($(e.target).attr('name'),$(e.target).val());
			this.getProfile();
		},
		saveProfile: function() {
			var self = this;
			this.model.save();
			setTimeout(function() {
				self.render();
			},400);
		}
		
	});

})