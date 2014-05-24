
if(!this.als){
	var als = {};
}

/**
 * Класс Метро.
 * @param {Object} params параметры объекта.
 * @constructor
 */
als.Metro = function(params){
	// инициализируем данные

	// Элемент в котором будет создаваться карта
	this.node = $(params.node);

	// Будущий контейнер карты
	this.box = null;

	// Будущий имаджмап
	this.map = null;
		
	// Имя города
	this.city = params.city || 'moscow';

	// Данные данного города
	this.cityData = {};

	// Массив объектов станций
	this.stations = [];

	// Массив объектов веток метро
	this.branches = [];

};

als.Metro.prototype = {

	/**
	 * Создание карты в контейнере
	 */
	show			: function(){
		var self = this;

		// Загружаем данные города
		self.load(function(){

			// сохраняем данные данного города
			self.cityData = als.Metro.data.cityData[self.city];
			
			// Подготавливаем контейнер
			self.prepareBox();

			// Создаем массив станций
			self.makeStations();

			// Создаем массив веток
			self.makeBranches();
		});

		return self;
	},


	/**
	 * Уничтожение карты
	 */
	hide			: function(){
		this.node.html('');
		return this;
	},

	
	/**
	 * Подготовка контейнера карты
	 */
	prepareBox		: function(){
		var
			self = this,

			// Путь к картинке со схемой метро
			src = self.path('metro.png'),

			// Имя класса для контейнера карты
			classname = 'als_metro als_metro_'+self.city,

			// Имя имаджмапа
			mapname = 'als_metro_branches_' + self.city
		;

		// Наполняем контейнер дефолтным кодом
		self.node.html(
			'<div class="' + classname + '">'+
				'<img src="' + src + '" usemap="#' + mapname + '" />'+
				'<div class="als_metro_fade"></div>'+
				'<map id="' + mapname + '" name="' + mapname + '"></map>'+
			'</div>'
		);

		// Инициализируем контейнер
		self.box = self.node.find('.als_metro');

		// Инициализируем имаджмап
		self.map = self.box.find('map');

		// Инициализируем фэйд
		self.fade = self.box.find('.als_metro_fade');

	},

	/**
	 * Создание станций карты
	 */
	makeStations	: function(){
		var
			self = this,
			list = self.cityData.stations
		;

		$.each(list,function(i,val){

			// Создаем объект станции
			var station = new als.Metro.Station(self.city,val);

			// Добавляем его в список станций объекта карты
			self.stations.push(station);

			// Добавляем сканцию в контейнер карты
			self.appendStation(station);

			// Добавляем обработчик для проверки показа фейда
			station.onStateChange(function(){
				self.checkFade();
			});
		});

		// проверяем  фейд
		self.checkFade();
	},


	checkFade	: function(){
		var
			self = this,
			flag = false
		;
		self.eachStation(function(i,station){
			if(station.selected){
				flag = true;
			}
		});
		self.fade.toggle(flag);
	},

	/**
	 * Добавление станции в контейнер карты
	 * @param {} station
	 */
	appendStation	: function(station){
		var self = this;
		self.box.append(station.node);
	},


	/**
	 *
	 */
	makeBranches	: function(){
		var
			self = this,
			list = self.cityData.branches
		;

		$.each(list,function(i,val){
	
			// Создаем объект ветки метро
			var branch = new als.Metro.Branch(self.city,val);

			self.addStationsToBranch(branch);

			// Добавляем его в список веток объекта карты
			self.branches.push(branch);

			// Добавляем ветку в контейнер карты
			self.appendBranch(branch);
		});
	},


	/**
	 * Добавление станций к веткам
	 * @param {als.Metro.Branch} branch
	 */
	addStationsToBranch	: function(branch){
		var
			self = this,
			links =  self.cityData.links
		;
		// Перебираем массив связи станций и веток
		$.each(links,function(i,val){
			// Если id ветки совпадает с данным
			if(val[1] == branch.id){
				// Находим станцию и добавляем ее к ветке
				branch.addStation(self.getStationById(val[0]));
			}
		});
	},


	/**
	 * Добавление станции в контейнер карты
	 * @param {als.Metro.Branch} branch
	 */
	appendBranch	: function(branch){
		var self = this;
		self.box.append(branch.node);
		self.box.append(branch.img_node);
		self.map.append(branch.areas);
	},


	/**
	 * Получение станции по её id
	 * @param {Number} id
	 * @return {als.Metro.Station} станция
	 */
	getStationById	: function(id){
		var
			self = this,
			res = null
		;

		self.eachStation(function(i,station){
			if(station.id == id){
				res = station;
			}
		});

		return res;
	},


	/**
	 * Перебор всех станций
	 * @param {Function} func Функция выполняемая для каждой станции
	 */
	eachStation		: function(func){
		$.each(this.stations,func);
	},

	/**
	 * Получение пути к файлу текущего города
	 * @param {String} file Имя файла
	 * @return {String} путь к файлу
	 */
	path	: function(file){
		return als.Metro.data.dir + '/' + this.city + '/' + file;
	},


	/**
	 * Загрузка данных
	 * @param {Function} callback
	 */
	load	: function(callback){
		var self = this;
		if(!als.Metro.data.cityData[self.city]){
			$.getJSON(als.Metro.data.url(self.city), function(data) {
				als.Metro.data.cityData[self.city] = data;
				if(callback) callback();
			});
		} else {
			if(callback) callback();
		};
	}
};




/**
 * Класс станции метро
 * @param {Object} params параметры станции.
 * @constructor
 */
als.Metro.Station = function(city,params){
	this.city = city;
	this.selected = false;
	$.extend(this,params);

	this.makeNode();
};

als.Metro.Station.prototype = {


	/**
	 * Создание элемента для станции
	 */
	makeNode	: function(){
		var self = this;

		// создаем элемент
		self.node = $('<div class="als_metro_station"></div>');

		// прописываем свойства элемента
		self.node
			.attr('title',self.name)

			// Добавляем обработчики событий
			.bind('statechange',function(){
				self.stateChange();
			})
			.click(function(){
				self.toggle();
			})

			// добавляем в data ссылку на объект для обратной связи
			.data('Obj',self)
		;

		// добавляем в элемент лейблы
		$.each(self.labels,function(i,val){
			self.node.append(self.makeLabelNode(val));
		});

	},

	/**
	 * Создание лейбла для станции
	 * @return {jQuery} элемент лейбла
	 */
	makeLabelNode	: function(params){
		var self = this;

		// создаем элемент
		var node = $('<div class="als_metro_station_label"></div>');

		// прописываем свойства элемента
		node
			.css({
				'left'		: params[0] + 'px',
				'top'		: params[1] + 'px',
				'width'		: params[2] + 'px',
				'height'	: params[3] + 'px',

				'backgroundPosition': '-' + params[0] + 'px -' + params[1] + 'px'
			})
		;

		return node;
	},


	/**
	 * Функция изменения состояния станции
	 * Если не задан параметр то переключает значение
	 * @param {Boolean} b новое значение состояния
	 */
	toggle	: function(b){
		var self = this;
		if(arguments.length){
			self.selected = !!b;
		} else {
			self.selected = !self.selected;
		};
		self.node.trigger('statechange');
	},

	/**
	 * Функция добавления события на изменение состояния станции
	 * @param {Function} func обработчик события
	 */
	onStateChange	: function(func){
		var self = this;
		self.node.bind('statechange',func);
		return this;
	},

	/**
	 * Обработчик события изменения состояния станции
	 * Меняет выделение станции в зависимости от значения флага объекта станции
	 */
	stateChange	: function(){
		var self = this;
		self.node.toggleClass('als_metro_station_active',self.selected);
	}
};





/**
 * Класс ветки метро
 * @param {Object} params параметры ветки.
 * @constructor
 */
als.Metro.Branch = function(city,params){
	this.city = city;
	this.areas = null;
	this.selected = false;
	this.stations = [];
	$.extend(this,params);

	this.makeNodes();
};


als.Metro.Branch.prototype = {

	/**
	 * Создание элементов для ветки
	 */
	makeNodes		: function(){
		var self = this;

		// создаем элемент
		self.node = $('<div class="als_metro_branch"></div>');

		// прописываем свойства элемента
		self.node
			.attr('title',self.name)
			
			// Добавляем обработчики событий
			.bind('statechange',function(){
				self.stateChange();
			})
			.click(function(){
				self.toggle();
				//self.stationsStateChange();
			})

			// добавляем в data ссылку на объект для обратной связи
			.data('Obj',self)
		;

		// добавляем в элемент лейблы
		$.each(self.labels,function(i,val){
			self.node.append(self.makeLabelNode(val));
		});

		// создаем элемент с картинкой ветки
		self.img_node = $('<div class="als_metro_branch_img"></div>');

		// прописываем свойства элемента
		self.img_node
			.css({
				'backgroundImage': 'url("'+ als.Metro.data.path(self.city,'branches/'+self.id+'.png') +'")'
			})
		;

		// создаем блоки AREA 		
		self.makeAreas();
	},


	/**
	 * Создание лейбла для ветки
	 * @return {jQuery} элемент лейбла
	 */
	makeLabelNode	: function(params){
		var self = this;

		// создаем элемент
		var node = $('<div class="als_metro_branch_label"></div>');

		// прописываем свойства элемента
		node
			.css({
				'left'		: params[0] + 'px',
				'top'		: params[1] + 'px',
				'width'		: params[2] + 'px',
				'height'	: params[3] + 'px',

				'backgroundPosition': '-' + params[0] + 'px -' + params[1] + 'px'
			})
		;

		return node;
	},


	makeAreas		: function(){
		var self = this;

		// создаем элементы
		var code = '';
		$.each(self.coords, function(i,val){
			code += '<area href="#" shape="poly" coords="' + val + '"/>';
		});
		self.areas = $('<div>'+code+'</div>').find('area');

		// прописываем свойства элементов
		self.areas
			.attr('title',self.name)

			// Добавляем обработчики событий
			.bind('statechange',function(){
				self.stateChange();
			})
			.click(function(e){
				e.preventDefault();
				
				self.toggle();
				//self.stationsStateChange();
			})
			.each(function(){
				$(this).data('Obj',self);
			})
		;
	},


	/**
	 * Добавление станции к ветке
	 * @param {als.Metro.Station} station
	 */
	addStation		: function(station){
		var self = this;

		// Добавляем станцию в список
		self.stations.push(station);

		// добавляем обработчик на изменение состояния станции
		station.onStateChange(function(){
			
			//console.log(this.className)
			self.toggle();
		});
	},

	/**
	 * Перебор всех станций ветки
	 * @param {Function} func Функция выполняемая для каждой станции
	 */
	eachStation		: function(func){
		$.each(this.stations,func);
	},


	/**
	 * Функция изменения состояния ветки
	 * Если не задан параметр то переключает значение
	 * @param {Boolean} b новое значение состояния
	 */
	toggle	: function(b){
		var self = this;
		if(arguments.length){
			self.selected = !!b;
		} else {
			self.selected = !self.checkSelected();
		};
		self.node.trigger('statechange');
	},

	/**
	 * Функция добавления события на изменение состояния ветки
	 * @param {Function} func обработчик события
	 */
	onStateChange	: function(func){
		var self = this;
		self.node.bind('statechange',func);
		return this;
	},

	/**
	 * Обработчик события изменения состояния ветки
	 * Меняет выделение ветки в зависимости от значения флага объекта ветки
	 */
	stateChange	: function(){
		var self = this;

		self.node.toggleClass('als_metro_branch_active',self.selected);
		self.img_node.toggleClass('als_metro_branch_img_active',self.selected);

//		self.eachStation(function(i,station){
//			station.toggle(self.selected);
//		});
	},

	/**
	 * Меняет выделение станций ветки в зависимости от значения флага объекта ветки
	 */
	stationsStateChange	: function(){
		var self = this;
		self.eachStation(function(i,station){
			station.toggle(self.selected);
		});
	},

	/**
	 * Проверка выделенности ветки
	 * Ветка выделена, если выделены все ее станции
	 * @return {Boolean} 
	 */
	checkSelected : function(){
		var
			self = this,
			res = true
		;

		self.eachStation(function(i,station){
			if(!station.selected){
				res = false;
			}
		});
		return res;
	}

};






als.Metro.data = {

	// Дефолтный путь к папке с файлами виджета
	dir			: '/f/1/global/metro',

	
	// Кеш данных для разных городов
	cityData	: {},

	/**
	 * Получение пути к файлу текущего города
	 * @param {String} city Имя города
	 * @param {String} file Имя файла
	 * @return {String} путь к файлу
	 */
	path	: function(city,file){
		return this.dir + '/' + city + '/' + file;
	},

	/**
	 * Путь к файлу с данными метро
	 * @param {String} city Имя города
	 */
	url			: function(city){
		return this.dir + '/' + city + '/new_stations.js';
	}
};



