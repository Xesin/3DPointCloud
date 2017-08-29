/**
 * @author Francisco Ferrer <xisco@xiscoferrer.com>
 * @license
 * Copyright © 2017 Francisco Ferrer Fernandez <http://www.xiscoferrer.com>
 * https://opensource.org/licenses/MIT
 */


var XEngine = {
	version: '1.0'
};


// ----------------------------------------- GAME ENGINE ------------------------------------------//

/**
 * Clase principal del juego, ésta inicia el juego y maneja su funcionamiento
 * 
 * @class XEngine.Game
 * @constructor
 * @param {Number} width - El ancho del juego
 * @param {Number} height - El alto del juego
 * @param {String} idContainer - En id del elemento canvas que está en el body del documento
 */
XEngine.Game = function (width, height, idContainer) {

	/**
	 * @property {HTMLElement} reference - Referencia al elemento canvas
	 * @readonly
	 */
	this.reference = document.getElementById(idContainer);
	/**
	 * @property {XEngine.Vector} position - Posición por defecto del juego
	 * @readonly
	 * @private
	 */
	this.position = new XEngine.Vector(0, 0);
	/**
	 * @property {Number} width - Ancho del juego
	 * @public
	 */
	this.width = width;
	/**
	 * @property {Number} height - Alto del juego
	 * @public
	 */
	this.height = height;
	/**
	 * @property {Number} worldWidth - Ancho del mundo (al iniciar es igual que el del juego)
	 * @public
	 */
	this.worldWidth = width;
	/**
	 * @property {Number} height - Alto del mundo (al iniciar es igual que el del juego)
	 * @public
	 */
	this.worldHeight = height;

	/**
	 * @property {CanvasRenderingContext2D} canvas - Contexto 2D del canvas
	 * @readonly
	 */
	//this.canvas = this.reference.getContext('2d');

	window.AudioContext = window.AudioContext || window.webkitAudioContext;

	/**
	 * @property {AudioContext} audioContext - Contexto del audio
	 * @readonly
	 */
	this.audioContext = new AudioContext();
	/**
	 * @property {Number} frameLimit - Limite de frames por segundo
	 * @default
	 */
	this.frameLimit = 120;
	/**
	 * @property {Number} _startTime - Tiempo tiempo en el que se arrancó el juego
	 * @readonly
	 */
	this._startTime = 0;
	/**
	 * @property {Number} _elapsedTime - Tiempo desde que se arrancó el juego
	 * @private
	 */
	this._elapsedTime = 0;
	/**
	 * @property {Number} frameTime - Tiempo en el que transcurre el frame
	 * @readonly
	 */
	this.frameTime = 0;
	/**
	 * @property {Number} previousFrameTime - Tiempo en el que transcurrió el último frame
	 * @readonly
	 */
	this.previousFrameTime = 0;
	/**
	 * @property {Number} deltaTime - Tiempo entre frames en segundos
	 * @readonly
	 */
	this.deltaTime = 0;
	/**
	 * @property {Number} deltaMillis - Tiempo entre frames en milisegundos
	 * @readonly
	 */
	this.deltaMillis = 0;

	/**
	 * @property {Bool} pause - Determina si el juego está pausado o no
	 * @public
	 */
	this.pause = false;

	/**
	 * @property {Array.<XEngine.BaseObject>} gameObjects - Array con las referencias de todos los objetos añadidos directamente al juego
	 * @readonly
	 */
	this.gameObjects = null;
	/**
	 * @property {XEngine.StateManager} state - Acceso al StateManager
	 * @readonly
	 */
	this.state = null;
	/**
	 * @property {XEngine.ObjectFactory} add - Fábrica de objetos. Esto ofrece acceso al creador de objetos
	 * @readonly
	 */
	this.add = null;
	/**
	 * @property {XEngine.Physics} physics - Motor de físicas
	 * @readonly
	 */
	this.physics = null;
	/**
	 * @property {XEngine.TweenManager} tween - Tween Manager. Da acceso a la creación de tweens.
	 * @readonly
	 */
	this.tween = null;
	/**
	 * @property {XEngine.Cache} cache - Caché del juego. Aquí se almacenan todos los assets que se cargan
	 * @readonly
	 */
	this.cache = null;
	/**
	 * @property {XEngine.Loader} load - Loader. Da acceso a la carga de assets
	 * @readonly
	 */
	this.load = null;
	/**
	 * @property {THREE.Camera} camera - Camara del juego
	 * @readonly
	 */
	this.camera = null;
	/**
	 * @property {XEngine.Cache} renderer - Renderer del juego.
	 * @readonly
	 * @private
	 */
	this.renderer = null;
	/**
	 * @property {XEngine.ScaleManager} scale - Scale manager
	 * @readonly
	 */
	this.scale = null;
	/**
	 * @property {Bool} isMobile - Define si se está ejecutando en móvil o no
	 * @readonly
	 */
	this.isMobile = false;
	/**
	 * @property {XEngine.InputManager} input - Input manager. Da acceso al inputManager
	 * @readonly
	 */
	this.input = null;

	/**
	 * @property {Number} ISO_TILE_WIDTH - Define el ancho de los tiles (para perspectiva isometrica)
	 * @public
	 */
	this.ISO_TILE_WIDTH = 32;

	/**
	 * @property {Number} ISO_TILE_HEIGHT - Define el alto de los tiles (para perspectiva isometrica)
	 * @public
	 */
	this.ISO_TILE_HEIGHT = 32;

	this.init(); //iniciamos el juego

	XEngine.Game._ref = this;
};

XEngine.Game.prototype.constructor = XEngine.Game;

XEngine.Game._updateCaller = function () {
	XEngine.Game._ref.update();
};

XEngine.Game.prototype = {
	/**
	 * Llamado automaticamente al crear el juego. Inicia todas las propiedades del juego y ejecuta el primer loop
	 * 
	 * @method XEngine.Game#init
	 * @private
	 */
	init: function () {
		var _this = this;
		console.log('Game engine ' + XEngine.version + ' arrancado con canvas!!!');
		_this._startTime = Date.now();
		_this._elapsedTime = 0;
		_this.frameTime = 0;
		_this.previousFrameTime = 0;
		_this.deltaTime = 0;
		_this.deltaMillis = 0;
		_this.gameObjects = new Array();
		_this.pause = false;
		_this.state = new XEngine.StateManager(_this);
		_this.add = new XEngine.ObjectFactory(_this);
		_this.tween = new XEngine.TweenManager(_this);
		_this.cache = new XEngine.Cache(_this);
		_this.load = new XEngine.Loader(_this);
		_this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 10000);
		_this.renderer = new XEngine.Renderer(_this);
		this.reference = _this.renderer.threejsRenderer.domElement;
		_this.scale = new XEngine.ScaleManager(_this);
		_this.scale.init();
		_this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); //Obtiene si se está ejecutando en un dispositivo móvil
		_this.input = new XEngine.InputManager(_this);
		_this.input.initialize();
		this.update(); //Iniciamos el loop
	},

	/**
	 * Asigna el color de background del canvas
	 * 
	 * @method XEngine.Game#setBackgroundColor
	 * @param {String} color - El color a poner de fondo
	 */
	setBackgroundColor: function (color) {
		//this.reference.style.backgroundColor = color;
	},

	/**
	 * Llamado automaticamente en cada frame
	 * 
	 * @method XEngine.Game#update
	 * @private
	 */
	update: function () {
		var _this = this;
		window.requestAnimationFrame(XEngine.Game._updateCaller);
	

		_this.elapsedTime = Date.now() - _this._startTime; //tiempo transcurrido desde que se creó el juego
		_this.frameTime = _this.elapsedTime; //tiempo en el que transcurre este frame
		_this.deltaMillis = Math.min(400, (_this.frameTime - _this.previousFrameTime)); //tiempo entre frames (en milisegundos)
		_this.deltaTime = _this.deltaMillis / 1000; //tiempo entre frames (en segundos)
		if (1 / _this.frameLimit > _this.deltaTime) return;
		_this.previousFrameTime = _this.frameTime; //guardamos el tiempo de este frame para después calcular el delta time
		if (_this.pause) return;
		if (_this.state.currentState == null) return; //Si no hay arrancado ningún estado, saltamos el update
		if (!this.load.preloading) { //Si no estamos precargando los assets, ejecutamos el update
			/*for (var i = _this.gameObjects.length - 1; i >= 0; i--) //Recorremos los objetos del juego para hacer su update
			{
				var gameObject = _this.gameObjects[i];
				if (gameObject.isPendingDestroy) //Si es un objeto destruido lo eliminamos del array
				{
					if (gameObject.body != undefined) { //Si tiene un body, también lo destruimos
						gameObject.body.destroy();
						delete _this.gameObjects[i].body; //Liberamos memoria
					}
					delete _this.gameObjects[i]; //Liberamos memoria
					_this.gameObjects.splice(i, 1);
				}
				else if (gameObject.alive) //En caso contrario miramos si contiene el método update y está vivo, lo ejecutamos
				{
					if (gameObject.update != undefined) {
						gameObject.update(_this.deltaTime);
					}
					if (XEngine.Sprite.prototype.isPrototypeOf(gameObject)) {
						gameObject._updateAnims(_this.deltaMillis);
					}
				}
			}*/

			if (_this.state.currentState.update != undefined) {
				_this.state.currentState.update(_this.deltaTime); //Llamamos al update del estado actual
			}

			_this.tween._update(_this.deltaMillis); //Actualizamos el tween manager
		}
		
		_this.renderer.render();
		
		
	},

	/**
	 * Se llama cuando se inicia un nuevo estado
	 * 
	 * @method XEngine.Game#destroy
	 * @private
	 */
	destroy: function () { //Este paso se llama cuando se cambia de un estado a otro
		for (var i = this.gameObjects.length - 1; i >= 0; i--) //Destruimos todos los objetos del juego
		{
			var gameObject = this.gameObjects[i];
			if (gameObject.destroy != undefined) {
				if (!gameObject.persist) {
					gameObject.destroy();
					if (gameObject.body != undefined) { //Si tienen un body, lo destruimos también
						gameObject.body.destroy();
						delete this.gameObjects[i].body; //Liberamos memoria
					}
					delete this.gameObjects[i]; //Liberamos memoria
					this.gameObjects.splice(i, 1);
				}
			}
		}
		this.physics._destroy(); //Llamamos a los destroy de los distintos componentes
		this.tween._destroy();
		
		this.camera.position.set(0,0,0);
		this.camera.rotation.set(0,0,0);
	},

	/**
	 * Unicamente para que los hijos directos del estado no tengan una referencia nula a este método
	 * 
	 * @method XEngine.Game#getWorldPos
	 * @private
	 * @returns {XEngine.Vector}
	 */
	getWorldPos: function () {
		return this.position;
	},


	/**
	 * Unicamente para que los hijos directos del estado no tengan una referencia nula a este método
	 * 
	 * @method XEngine.Game#getTotalRotation
	 * @private
	 * @returns {Number}
	 */
	getTotalRotation: function () {
		return 0;
	}
};

// ----------------------------------------- STATE MANAGER ------------------------------------------//

/**
 * Manager que controla los distintos estados que se añadan
 * 
 * @class XEngine.StateManager
 * @constructor
 * @param {XEngine.Game} game - Referencia al objeto game
 */
XEngine.StateManager = function (game) {
	/**
	 * @property {XEngine.Game} game - Referencia al juego
	 * @readonly
	 */
	this.game = game;
	/**
	 * @property {Array.<*>} states - Array de estados que se han añadido al juego
	 * @public
	 */
	this.states = new Array();
	/**
	 * @property {*} currentState - Estado en el que se encuentra actualmente el juego
	 * @readonly
	 */
	this.currentState = null;
	/**
	 * @property {String} currentStateName - Nombre del estado actual
	 * @readonly
	 */
	this.currentStateName = null;
};

XEngine.StateManager.prototype = {
	/**
	 * Añade un estado al array de estados
	 * @method XEngine.StateManager#add
	 * @param {String} stateName - KeyName del estado
	 * @param {Object} stateClass - Objeto de la clase del estado
	 */
	add: function (stateName, stateClass) { //Añade un estado al array de estados
		this.states[stateName] = stateClass;
	},

	/**
	 * Arranca un estado
	 * @method XEngine.StateManager#start
	 * @param {String} stateName - KeyName del estado
	 */
	start: function (stateName) { //Iniciamos un nuevo estado
		var _this = this;
		if (_this.currentState != null) {
			_this.game.destroy(); //Llamamos al destroy del game si venimos de otro estado
			if (_this.currentState.destroy != undefined) {
				_this.currentState.destroy(); //Llamammos al destroy del estado si este lo tiene implementado
			}
			delete _this.currentState; //Liberamos la memoria del objeto almacenado
			_this.currentState = null; //asignamos a null el estado
		}
		var state = _this.states[stateName]; //Obtener el estado al que queremos ir

		if (state == null) { //Si no existe mostramos un error y paramos la ejecución;
			console.error("no state for name " + stateName);
			return;
		}

		_this.currentState = new state(_this.game); //Creamos el nuevo estado y lo ponemos como actual
		_this.currentState.scene = new THREE.Scene();
		_this.currentState.game = _this.game; //Asignamos la referencia de game al estado
		_this.currentState.stateName = stateName; //Asignamos el propio nombre del estado
		if (_this.currentState.preload != undefined) { //Si el estado tiene preload, lo llamamos
			_this.currentState.preload();
		}
		_this.game.load._startPreload(); //Una vez se ha llamado al preload del estado, podemos proceder a cargar los assets
		_this.game.scale.updateScale();
	},

	/**
	 * Reinicia el estado actual
	 * @method XEngine.StateManager#restart
	 */
	restart: function () {
		this.start(this.currentState.stateName); //Reiniciamos el estado actual
	}
};


// ----------------------------------------- PRELOADER AND CACHE ------------------------------------------//

/**
 * Manager que controla la carga de assets
 * 
 * @class XEngine.Loader
 * @constructor
 * @param {XEngine.Game} game - Referencia al objeto game
 */
XEngine.Loader = function (game) {
	this.game = game;
	this.pendingLoads = new Array(); //Objetos a cargar
	this.progress = 0; //Progreso (de 0 a 1 == de 0% a 100%)
	this.preloading = false; //En progreso de precarga, por defecto a false
	this.onCompleteFile = new XEngine.Signal(); //Evento que se dispara cada vez que se completa una descarga. Envía el progreso actual
	this.threeTextureLoader = null;
	this.threeCubeTextureLoader = null;
	this.threeJsonLoader = null;
};

XEngine.Loader.prototype = {
	/**
	 * Añade una imagen a la cola de carga
	 * @method XEngine.Loader#texture
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 */
	texture: function (textureName, imageUrl) {
		this.pendingLoads.push(new XEngine.TextureLoader(textureName, imageUrl, this));
	},

	/**
	 * Añade hoja de sprites a la cola de carga
	 * @method XEngine.Loader#cubeTexture
	 * @param {String} imageName - KeyName de la imagen
	 * @param {String} imageUrl - fuente de la imagen
	 * @param {Number} frameWidth - ancho de cada frame
	 * @param {Number} frameHeight - alto de cada frame
	 */
	cubeMap: function (cubeName, path, imageUrls) {
		this.pendingLoads.push(new XEngine.CubeMapLoader(cubeName, path, imageUrls, this));
	},

	/**
	 * Añade una geometría en json a la cache
	 * @method XEngine.Loader#spriteSheet
	 * @param {String} geometryName - KeyName de la geometria
	 * @param {String} geometryURL - fuente de la geometria
	 */
	jsonGeometry: function (geometryName, geometryURL) {
		this.pendingLoads.push(new XEngine.JsonGeometryLoader(geometryName, geometryURL, this));
	},

	/**
	 * Añade un audio a la cola de carga
	 * @method XEngine.Loader#audio
	 * @param {String} audioName - KeyName del audio
	 * @param {String} audioUrl - fuente del audio
	 */
	audio: function (audioName, audioUrl) {
		this.pendingLoads.push(new XEngine.AudioLoader(audioName, audioUrl, this));
	},

	/**
	 * Arranca la carga de archivos
	 * @method XEngine.Loader#startPreload
	 * @private
	 */
	_startPreload: function () {
		this.preloading = true;
		if (this.pendingLoads.length == 0) { //Si no hay cargas pendientes, llama directamente al start
			this._callStart();
		}
		else { //En caso contrario llama al load de cada objeto a cargar
			for (var i = 0; i < this.pendingLoads.length; i++) {
				this.pendingLoads[i].load();
			}
		}
	},

	/**
	 * Actualiza las tareas completadas y las notifica cada vez que una termina
	 * @method XEngine.Loader#notifyCompleted
	 * @private
	 */
	_notifyCompleted: function () {
		var completedTasks = 0;

		for (var i = 0; i < this.pendingLoads.length; i++) { //Recorremos las cargas pendientes para ver cuales se han completado
			if (this.pendingLoads[i].completed) {
				completedTasks++;
			}
		}

		this.progress = completedTasks / this.pendingLoads.length; //Calculamos el progreso
		this.onCompleteFile.dispatch(this.progress); //Disparamos el evento

		if (this.progress == 1) { //Si el progreso llega al 100% terminamos, liberamos memoria y llamamos al start
			delete this.pendingLoads;
			this.onCompleteFile._destroy();
			this.pendingLoads = new Array();
			this._callStart();
		}
	},

	/**
	 * Una vez que finaliza el proceso de carga o no hay datos a cargar, se llama al start del estado
	 * @method XEngine.Loader#callStart
	 * @private
	 */
	_callStart: function () {
		this.preloading = false;
		this.game.state.currentState.start(); //Llama al start del estado actual
	},
};

/**
 * Objeto que maneja la carga de las imagenes
 * 
 * @class XEngine.TextureLoader
 * @constructor
 * @param {String} textureName - KeyName de la imagen a cargar
 * @param {String} imageUrl - uri donde está la imagen
 * @param {XEngine.Loader} loader - referencia al loader
 */
XEngine.TextureLoader = function (textureName, imageUrl, loader) {
	this.textureName = textureName; //Nombre de la textura a guardar en chache
	this.imageUrl = imageUrl; //Url de la imagen (con extension y todo)
	this.completed = false;
	this.loader = loader; //Referencia al loader
	if(this.loader.threeTextureLoader == null){
		this.loader.threeTextureLoader = new THREE.TextureLoader();
	}
};

XEngine.TextureLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.TextureLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newTexture = { //Creamos el objeto a guardar en cache
			textureName: _this.textureName, //Nombre de la imagen
			texture: null, //Referencia de la imagen
			type: "texture"
		};
		var texture = null;
		var handler = function (event) { //Creamos el handler de cuando se completa o da error
			var textureRef = _this.loader.game.cache.textures[_this.textureName]; //Obtenemos la imagen de cache
			event.wrapS = THREE.RepeatWrapping;
			event.wrapT = THREE.RepeatWrapping;
			
			textureRef.texture = event; //Asignamos la referencia
			
			_this.completed = true;
			_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
		};
		
		_this.loader.game.cache.textures[_this.textureName] = newTexture; //Guardamos nuesto objeto de imagen en cache para luego recogerlo
		
		_this.loader.threeTextureLoader.load(_this.imageUrl, handler);
	}
};

/**
 * Objeto que maneja la carga de cubemaps
 * 
 * @class XEngine.CubeMapLoader
 * @constructor
 * @param {String} textureName - KeyName de la imagen a cargar
 * @param {String} imageUrl - uri donde está la imagen
 * @param {XEngine.Loader} loader - referencia al loader
 */
XEngine.CubeMapLoader = function (cubeName, path, imagesPath, loader) {
	this.cubeName = cubeName; //Nombre de la textura a guardar en chache
	this.imageUrls = imagesPath; //Url de la imagen (con extension y todo)
	this.path = path;
	this.completed = false;
	this.loader = loader; //Referencia al loader
	if(this.loader.threeCubeTextureLoader == null){
		this.loader.threeCubeTextureLoader = new THREE.CubeTextureLoader();
	}
};

XEngine.CubeMapLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.TextureLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newCubeMap = { //Creamos el objeto a guardar en cache
			cubeName: _this.cubeName, //Nombre de la imagen
			texture: null, //Referencia de la imagen
			type: "cubeMap"
		};
		var texture = null;
		var handler = function (event) { //Creamos el handler de cuando se completa o da error
			var textureRef = _this.loader.game.cache.cubeMaps[_this.cubeName]; //Obtenemos la imagen de cache
			
			textureRef.texture = event; //Asignamos la referencia
			
			_this.completed = true;
			_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
		};
		
		_this.loader.game.cache.cubeMaps[_this.cubeName] = newCubeMap; //Guardamos nuesto objeto de imagen en cache para luego recogerlo
		
		_this.loader.threeCubeTextureLoader.setPath(_this.path);
		
		_this.loader.threeCubeTextureLoader.load(_this.imageUrls, handler);
	}
};

/**
 * Objeto que maneja la carga de geometria json
 * 
 * @class XEngine.JsonGeometryLoader
 * @constructor
 * @param {String} textureName - KeyName de la imagen a cargar
 * @param {String} imageUrl - uri donde está la imagen
 * @param {XEngine.Loader} loader - referencia al loader
 */
XEngine.JsonGeometryLoader = function (geometryName, geometryURL, loader) {
	this.geometryName = geometryName; //Nombre de la textura a guardar en chache
	this.geometryURL = geometryURL; //Url de la imagen (con extension y todo)
	this.completed = false;
	this.loader = loader; //Referencia al loader
	if(this.loader.threeJsonLoader == null){
		this.loader.threeJsonLoader = new THREE.JSONLoader();
	}
};

XEngine.JsonGeometryLoader.prototype = {
	/**
	 * Arranca la carga de la imagen
	 * @method XEngine.JsonGeometryLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newGeometry = { //Creamos el objeto a guardar en cache
			geometryName: _this.geometryName, //Nombre de la imagen
			geometry: null, //Referencia de la imagen
			mat: null,
			type: "texture"
		};
		var geometry = null;
		var mat = null;
		var handler = function (geometry, mat) { //Creamos el handler de cuando se completa o da error
			var geometryRef = _this.loader.game.cache.geometries[_this.geometryName]; //Obtenemos la imagen de cache
			
			geometryRef.geometry = geometry; //Asignamos la referencia
			geometryRef.mat = mat;
			
			_this.completed = true;
			_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
		};
		
		_this.loader.game.cache.geometries[_this.geometryName] = newGeometry; //Guardamos nuesto objeto de imagen en cache para luego recogerlo
		
		_this.loader.threeJsonLoader.load(_this.geometryURL, handler);
	}
};

/**
 * Objeto que maneja la carga sonidos
 * 
 * @class XEngine.AudioLoader
 * @constructor
 * @param {String} audioName - KeyName de la imagen a cargar
 * @param {String} audioUrl - uri donde está la imagen
 * @param {XEngine.Loader} loader - referencia al loader
 */
XEngine.AudioLoader = function (audioName, audioUrl, loader) {
	this.audioName = audioName; //Nombre del audio a guardar en chache
	this.audioUrl = audioUrl; //Url del audio (con extension y todo)
	this.completed = false;
	this.loader = loader; //Referencia al loader
};

XEngine.AudioLoader.prototype = {
	/**
	 * Arranca la carga del audio
	 * @method XEngine.AudioLoader#load
	 * @private
	 */
	load: function () {
		var _this = this;
		var newAudio = { //Creamos el objeto a guardar en cache
			audioName: _this.audioName, //Nombre del audio
			audio: null, //Referencia del audio
			decoded: false, //El audio ya está decodificado?
		};
		var request = new XMLHttpRequest();
		request.open('GET', _this.audioUrl, true);
		request.responseType = 'arraybuffer';
		var handler = function () { //Creamos el handler de cuando se completa o da error
			var audioRef = _this.loader.game.cache.audios[_this.audioName]; //Obtenemos el audio de cache
			if (request.status == 200) {
				_this.loader.game.audioContext.decodeAudioData(request.response, function (buffer) {
					audioRef.audio = buffer;
					audioRef.decoded = true;
					_this.completed = true;
					_this.loader._notifyCompleted();
				}, function () {
					_this.completed = true; //Marcamos como completado
					_this.loader._notifyCompleted();
				});
			}
			else {
				_this.completed = true; //Marcamos como completado
				_this.loader._notifyCompleted(); //Notificamos de que la carga se ha completado
			}
		};
		request.onload = handler;
		_this.loader.game.cache.audios[_this.audioName] = newAudio; //Guardamos nuesto objeto de audio en cache para luego recogerlo
		request.send();
	}
};


/**
 * Objeto que almacena los assets cargados
 * 
 * @class XEngine.Cache
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.Cache = function (game) {
	this.game = game;
	this.textures = new Array(); //Cache de imagenes
	this.cubeMaps = new Array(); //Cache de imagenes
	this.geometries = new Array();
	this.audios = new Array(); //Cache de audios
};

XEngine.Cache.prototype = {
	/**
	 * Devuelve una imagen guardada en cache
	 * @method XEngine.Cache#image
	 * @param {String} imageName - keyName de la imagen
	 * @private
	 */
	texture: function (textureName) {
		if (this.textures[textureName] == undefined) {
			console.error('No hay imagen para el nombre: ' + textureName);
		}
		else {
			return this.textures[textureName];
		}
	},
	
	/**
	 * Devuelve una imagen guardada en cache
	 * @method XEngine.Cache#cubeMap
	 * @param {String} cubeName - keyName de la textura
	 * @private
	 */
	cubeMap: function (cubeName) {
		if (this.cubeMaps[cubeName] == undefined) {
			console.error('No hay cubemap para el nombre: ' + cubeName);
		}
		else {
			return this.cubeMaps[cubeName];
		}
	},
	
	/**
	 * Devuelve una geometria guardada en cache
	 * @method XEngine.Cache#geometry
	 * @param {String} geometryName - keyName de la geometria
	 * @private
	 */
	geometry: function (geometryName) {
		if (this.geometries[geometryName] == undefined) {
			console.error('No hay geometria para el nombre: ' + geometryName);
		}
		else {
			return this.geometries[geometryName];
		}
	},
	

	/**
	 * Devuelve un audio guardado en cache
	 * @method XEngine.Cache#audio
	 * @param {String} audioName - keyName del audio
	 * @private
	 */
	audio: function (audioName) {
		if (this.audios[audioName] == undefined) {
			console.error('No hay audio para el nombre: ' + audioName);
		}
		else {
			return this.audios[audioName];
		}
	},

	/**
	 * Borra toda la cache
	 * @method XEngine.Cache#clearChache
	 */
	clearCache: function () {
		delete this.textures;
		delete this.audios;
		delete this.cubeMaps;
		delete this.geometries;
		this.textures = new Array();
		this.audios = new Array();
		this.cubeMaps = new Array();
		this.geometries = new Array();
		
	}
};

// -------------------------------------------- RENDERER ---------------------------------------------//

/**
 * Renderer principal del juego (usa el contexto de canvas)
 * 
 * @class XEngine.Renderer
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 * @param {CanvasRenderingContext2D} context - contexto en el que pinta este renderer
 */
XEngine.Renderer = function (game) {
	this.game = game;
	this.scale = {
		x: 1,
		y: 1
	};
	
	this.threejsRenderer = new THREE.WebGLRenderer({antialias: true});
		
	this.threejsRenderer.setClearColor(0x000000);
	this.threejsRenderer.setPixelRatio(1);
	this.threejsRenderer.setSize(this.game.worldWidth, this.game.worldHeight);
	
	document.body.appendChild(this.threejsRenderer.domElement);
	
	this.context = this.threejsRenderer.domElement.getContext("webGL");

};

XEngine.Renderer.prototype = {
	/**
	 * Inicia el proceso de render
	 * @method XEngine.Renderer#render
	 * @private
	 */
	render: function () {
		this.threejsRenderer.render( this.game.state.currentState.scene, this.game.camera);
	},

	/**
	 * Asigna la escala del renderer (Para cuando el canvas está escalado)
	 * @method XEngine.Renderer#setScale
	 * @param {Number} x - Escala en x
	 * @param {Number} y - Escala en y
	 * @private
	 */
	setScale: function (x, y) {
		this.scale.x = x;
		this.scale.y = y || x;
	},

	/**
	 * Obtiene la información de color del frame acutal
	 * @method XEngine.Renderer#getFrameInfo
	 * @return {Array.<object>}
	 */
	getFrameInfo: function () {
		var data = this.context.getImageData(0, 0, this.game.width, this.game.height).data;
		var returnData = new Array();
		//Push pixel data to more usable object
		for (var i = 0; i < data.length; i += 4) {
			var rgba = {
				r: data[i],
				g: data[i + 1],
				b: data[i + 2],
				a: data[i + 3]
			};

			returnData.push(rgba);
		}

		return returnData;
	},

	/**
	 * Obtiene la información de color de un pixel
	 * @method XEngine.Renderer#getPixelInfo
	 * @param {Number} posX - Posición x del pixel
	 * @param {Number} posY - Posición y del pixel
	 * @return {Array.<object>}
	 */
	getPixelInfo: function (posX, posY) {
		var data = this.context.getImageData(Math.round(posX), Math.round(posY), 1, 1).data;
		var rgba = {
			r: data[0],
			g: data[1],
			b: data[2],
			a: data[3]
		};
		return rgba;
	}
};

// ----------------------------------------- SCALE MANAGER -------------------------------------------//

/**
 * Manager que se encarga de escalar el manager según el tipo de escala que se especifique
 * 
 * @class XEngine.ScaleManager
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.ScaleManager = function (game) {
	this.game = game;
	this.scaleType = XEngine.Scale.NO_SCALE;
	this.orientation = 'landScape';
	this.sourceAspectRatio = 0;
};

XEngine.Scale = {
	FIT: 0,
	SHOW_ALL: 1,
	NO_SCALE: 2,
};

XEngine.ScaleManager.prototype = {
	/**
	 * Inicializa el ScaleManager. Se llama al iniciar el juego
	 * @method XEngine.ScaleManager#init
	 * @private
	 */
	init: function () {
		var _this = this;
		var onWindowsResize = function (event) {
			_this.onWindowsResize(event);
		};
		window.addEventListener('resize', onWindowsResize, true);
	},

	/**
	 * Callback que se llama al redimensionar la ventana
	 * @method XEngine.ScaleManager#onWindowsResize
	 * @param {Object} event - Evento que lanza el listener
	 * @private
	 */
	onWindowsResize: function (event) {
		this.updateScale();
	},

	/**
	 * Actualiza el tamaño del canvas y la escala que tiene. Es llamada por el callback onWindowsResize
	 * @method XEngine.ScaleManager#updateScale
	 */
	updateScale: function () {
		if (this.scaleType !== XEngine.Scale.NO_SCALE) {
			var newWidth = 0;
			var newHeight = 0;
			if (this.scaleType === XEngine.Scale.FIT) {
				newWidth = window.innerWidth;
				newHeight = window.innerHeight;
			}
			else {
				this.sourceAspectRatio = this.game.width / this.game.height;
				newHeight = window.innerHeight ;
				newWidth = newHeight * this.sourceAspectRatio;
				if (newWidth > window.innerWidth) {
					newWidth = window.innerWidth;
					newHeight = newWidth / this.sourceAspectRatio;
				}
			}
			newWidth = Math.round(newWidth);
			newHeight = Math.round(newHeight);
			this.resizeCanvas(newWidth, newHeight);
		}
	},

	/**
	 * Cambia el tamaño del canvas
	 * @method XEngine.ScaleManager#resizeCanvas
	 * @param {Number} newWidth - nuevo ancho del canvas
	 * @param {Number} newHeight - nuevo alto del canvas
	 */
	resizeCanvas: function (newWidth, newHeight) {
		if(this.game.reference){
			
			this.game.camera.aspect = newWidth / newHeight;
			
		    this.game.camera.updateProjectionMatrix();
		
		    this.game.renderer.threejsRenderer.setSize( newWidth, newHeight );
		}
		this.game.renderer.setScale(newWidth / this.game.width, newHeight / this.game.height);
	},
};

// ----------------------------------------- OBJECT FACTORY ------------------------------------------//

/**
 * Se encarga de crear y añadir a la escena los distintos objetos del juego
 * 
 * @class XEngine.ObjectFactory
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.ObjectFactory = function (game) {
	this.game = game;
};

XEngine.ObjectFactory.prototype = {
	/**
	 * Añade un objeto ya existente (creado con new) al juego
	 * @method XEngine.ObjectFacory#existing
	 * @param {XEngine.BaseObject} gameObject - Objeto a añadir
	 * @return {Object}
	 */
	existing: function (gameObject) { //Añade un objeto que ya ha sido creado
		this.game.gameObjects.push(gameObject); //Añadimos el objeto al array de objetos
		gameObject.parent = this.game; //Asignamos el padre del objeto
		if (gameObject.start != undefined) {
			gameObject.start();
		}
		return gameObject;
	},


	/**
	 * Crea y añade una imagen que hace la función de bottón
	 * @method XEngine.ObjectFacory#button
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {String} sprite - keyName de la imagen
	 * @param {String} spriteDown - keyName de la imagen cuando se pulsa el botón
	 * @param {String} spriteOver - keyName de la imagen cuando se pasa el ratón por encima
	 * @param {String} spriteUp - keyName de la imagen cuando se levanta el input
	 * @return {XEngine.Button}
	 */
	button: function (posX, posY, sprite, spriteDown, spriteOver, spriteUp) {
		var gameObject = new XEngine.Button(this.game, posX, posY, sprite, spriteDown, spriteOver, spriteUp);
		return this.existing(gameObject);
	},

	/**
	 * Crea y añade un objeto de texto
	 * @method XEngine.ObjectFacory#text
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @param {String} text - texto a mostrar
	 * @param {Object} textStyle - objeto que contiene los parametros de estilo
	 * @return {XEngine.Text}
	 */
	text: function (posX, posY, text, textStyle) {
		var gameObject = new XEngine.Text(this.game, posX, posY, text, textStyle);
		return this.existing(gameObject);
	},

	/**
	 * Crea y añade un objeto de audio
	 * @method XEngine.ObjectFacory#audio
	 * @param {String} audio - keyName del archivo de audio a reproducir
	 * @param {Boolean} autoStart - indica si empieza al crearse o no
	 * @param {Number} volume - indica el volumen del audio;
	 * @return {XEngine.Audio}
	 */
	audio: function (audio, autoStart, volume) {
		var audioObject = new XEngine.Audio(this.game, audio, autoStart, volume);
		return this.existing(audioObject);
	},

	/**
	 * Crea y añade un contenedor de objetos
	 * @method XEngine.ObjectFacory#group
	 * @param {Number} posX - Posición X del objeto
	 * @param {Number} posY - Posición Y del objeto
	 * @return {XEngine.Group}
	 */
	group: function (posX, posY, posZ) { //Creamos y añadimos un grupo
		var x = posX || 0;
		var y = posY || 0;
		var gameObject = new XEngine.Group(this.game, x, y);
		return this.existing(gameObject);
	}
};

// ----------------------------------------- TWEENS ------------------------------------------//

/**
 * Manager que se encarga de la creación y el manejo de Tweens
 * 
 * @class XEngine.TweenManager
 * @constructor
 * @param {XEngine.Game} game - referencia al objeto del juego
 */
XEngine.TweenManager = function (game) {
	this.game = game;
	this.tweens = new Array();
};

XEngine.TweenManager.prototype = {

	/**
	 * Añade un tween que controla el target que se le pasa por parametro
	 * @method XEngine.TweenManager#add
	 * @param {Object} target - objeto al que se le va a aplicar el tween en una de sus propiedades
	 * @return {XEngine.Tween}
	 */
	add: function (target) { //Añade un tween para el objeto que se le pasa por parametro
		var tween = new XEngine.Tween(target);
		this.tweens.push(tween);
		return tween;
	},

	_update: function (deltaTimeMillis) {
		var _this = this;
		for (var i = _this.tweens.length - 1; i >= 0; i--) //Recorremos todos los tweens que han sido creados
		{
			var tween = _this.tweens[i];
			if (tween.isPendingDestroy) { //Si el tween está marcado para destruir, liberamos memoria y lo quitamos del array
				delete _this.tweens[i];
				_this.tweens.splice(i, 1);
			}
			else if (tween.isRunning) { //Si está en marcha, lo actualizamos
				tween._update(deltaTimeMillis);
			}
			else if (tween.autoStart && !tween.started) { //Si no está en marcha pero tiene autoStart, lo arrancamos
				tween.play();
			}
		}
	},

	/**
	 * Destruye todos los tweens
	 * @method XEngine.TweenManager#_destroy
	 * @private
	 */
	_destroy: function () {
		for (var i = this.tweens.length - 1; i >= 0; i--) //Liberamos la memoria de todos los tweens que teníamos creados
		{
			this.tweens[i].destroy();
			delete this.tweens[i];
		}
		delete this.tweens;
		this.tweens = new Array();
	}
};

/**
 * Objeto que controla las propiedades del objeto que se le asigna
 * 
 * @class XEngine.Tween
 * @constructor
 * @param {*} target - objeto a controlar
 */
XEngine.Tween = function (target) {
	/**
	 * @property {Boolean} isPendingDestroy - Determina si el tween va a ser eliminado en el proximo update
	 * @readonly
	 */
	this.isPendingDestroy = false;
	/**
	 * @property {Boolean} started - Determina si el tween ha empezado
	 * @readonly
	 */
	this.started = false;
	/**
	 * @property {*} target - Objeto al que se le modifican los atributos
	 * @private
	 */
	this.target = target;
	/**
	 * @property {Array.<*>} fromProperties - Propiedades iniciales
	 * @private
	 */
	this.fromProperties = new Array();
	/**
	 * @property {Array.<*>} properties - Propiedades a las que se quiere llegar
	 * @private
	 */
	this.properties = new Array(); 
	/**
	 * @property {Number} duration - Duracion en milisegundos
	 * @public
	 */
	this.duration = 0;
	/**
	 * @property {Boolean} autoStart - Determina si el tween tiene el auto start activado (solo es valida su modificación antes de que empiece el tween)
	 * @public
	 */
	this.autoStart = true;
	/**
	 * @property {XEngine.Easing} easing - Funcion de Easing a usar
	 * @public
	 */
	this.easing = undefined;
	/**
	 * @property {Number} delay - Tiempo que tarda el tween en empezar desde que se llama al play
	 * @public
	 */
	this.delay = 0;
	/**
	 * @property {Number} repeat - Cantidad de veces a repetir (si es -1 se repite continuamente)
	 * @public
	 */
	this.repeat = 0;
	/**
	 * @property {Number} runCount - Cantidad de veces que se ha ejecutado el tween desde el principio
	 * @readonly
	 */
	this.runCount = 0;
	/**
	 * @property {Boolean} isRunning - Determina si el tween se está ejecutando
	 * @readonly
	 */
	this.isRunning = false;
	/**
	 * @property {Number} progress - Progreso actual del tween (valor entre 0 y 1)
	 * @public
	 */
	this.progress = 0;
	/**
	 * @property {Number} time - Tiempo en milisegundos que lleva corriendo el tween
	 * @readonly
	 */
	this.time = 0;
	/**
	 * @property {Boolean} yoyo - Determina si el tween solo va a las propiedades asignadas o también vuelve a las originales
	 * @public
	 */
	this.yoyo = false;
	/**
	 * @property {XEngine.Signal} onComplete - Se llama al completarse el tween
	 * @public
	 */
	this.onComplete = new XEngine.Signal(); 
	/**
	 * @property {XEngine.Signal} onCompleteLoop - Se llama al completarse un loop del tween
	 * @public
	 */
	this.onCompleteLoop = new XEngine.Signal();
};

XEngine.Tween.prototype = {

	/**
	 * Arranca el tween con el delay que se haya definido
	 * @method XEngine.Tween#play
	 */
	play: function () {
		var _this = this;
		_this.started = true; //Marcamos que ya se ha llamado al play
		var timer = setTimeout(function () { //Le aplica el delay
			clearTimeout(timer); //Limpiamos el timer una vez que se ejecuta
			_this._startTween();
		}, _this.delay);
	},

	/**
	 * Metodo interno para arrancar el tween
	 * @method XEngine.Tween#_startTween
	 * @param {Object} target - objeto al que se le va a aplicar el tween en una de sus propiedades
	 * @private
	 */
	_startTween: function () {
		this.runCount++; //Aumentamos el contador de ejecuciones
		for (var property in this.properties) {
			this.target[property] = this.fromProperties[property]; //Asignamos las propiedades de inicio al objetivo
		}
		this.isRunning = true; //Marcamos como que se está ejecutando
	},

	/**
	 * completa el tween sin tener en cuenta el tiempo que haya pasado
	 * @method XEngine.Tween#complete
	 */
	complete: function () {
		this.time = this.duration;
		for (var property in this.properties) { //Para cada propiedad, calculamos su valor actual y se lo asignamos al objetivo
			this.target[property] = this.fromProperties[property];
		}
	},

	_update: function (deltaTime) {
		if (this.target == undefined || this.target == null) {
			this._destroy();
			return;
		} //Si el target ha sido destruido, destruimos el tween
		var _this = this;
		if ((_this.progress == 1)) { //Si el tween llega al final, se comprueba si tiene que hacer loop o ha acabado
			if (_this.repeat == -1 || _this.runCount <= _this.repeat) {
				_this.onCompleteLoop.dispatch();
				_this.time = 0;
				_this.progress = 0;
				_this.play();
			}
			else {
				_this.onComplete.dispatch();
				_this.destroy();
			}
			return;
		}
		_this.progress = XEngine.Mathf.clamp(_this.time / _this.duration, 0, 1); //Calculamos el progreso del tween basado en el tiempo que está corriendo y la duración
		for (var property in _this.properties) { //Para cada propiedad, calculamos su valor actual y se lo asignamos al objetivo
			var t = _this.progress;
			if (_this.yoyo) {
				if (t <= 0.5) {
					t *= 2;
				}
				else {
					var t2 = (t - 0.5) * 2;
					t = XEngine.Mathf.lerp(1, 0, t2);
				}
			}
			this.target[property] = XEngine.Mathf.lerp(_this.fromProperties[property], _this.properties[property], _this.easing(t));
		}
		_this.time += deltaTime; //Incrementamos el tiempo de ejecución
	},

	/**
	 * Añade las propiedades a cambiar, la duración, easing, etc del tween
	 * @method XEngine.Tween#to
	 * @param {Object} properties - objeto que contiene las propiedades a cambiar y su valor final
	 * @param {Number} duration - tiempo en milisegundos que va a durar el tween
	 * @param {XEngine.Easing} ease - Funcion de easing que va a tener el tween
	 * @param {Boolean} autoStart - define si el tween empieza al crearse
	 * @param {Number} delay - tiempo en milisegundos que tarda el tween en empezar una vez que se le ha dado al play
	 * @param {Number} repeat - define la cantidad de veces que se repite el tween (-1 indica que siempre se repite)
	 * @param {Boolean} yoyo - define si el tween va y vuelve a sus propiedades iniciales
	 * @return {XEngine.Tween}
	 */
	to: function (properties, duration, ease, autoStart, delay, repeat, yoyo) {
		for (var property in properties) { //Se asignan todas las propiedades de las que se proviene
			this.fromProperties[property] = this.target[property];
		}
		this.properties = properties; //Se asignan las propiedades a las que se quieren llegar
		this.duration = duration; //Se asigna la duración, easing, etc
		this.easing = ease;
		this.autoStart = autoStart || true;
		this.delay = delay || 0;
		this.repeat = repeat || 0;
		this.yoyo = yoyo || false;
		return this;
	},


	/**
	 * Destruye el tween
	 * @method XEngine.Tween#destroy
	 */
	destroy: function () { //Se destruye el tween y se libera memoria 
		this.isRunning = false;
		this.isPendingDestroy = true;
		if (this.onComplete != undefined) {
			this.onComplete._destroy();
		}
		if (this.onCompleteLoop != undefined) {
			this.onCompleteLoop._destroy();
		}
		delete this.onComplete;
		delete this.onCompleteLoop;
		delete this.fromProperties;
		delete this.properties;
	},

	/**
	 * asigna unas propiedades iniciacles definidas por el usuario (se tiene que llamar después del to)
	 * @method XEngine.Tween#from 
	 * @param {Object} properties - objeto que contiene las propiedades a cambiar y su valor final
	 * @return {XEngine.Tween}
	 */
	from: function (properties) {
		for (var property in properties) {
			this.fromProperties[property] = properties[property];
		}
		return this;
	}

};

/**
 * @callback easingFunction
 * @param {Number} t - tiempo en el que se encuentra el tween (valores entre 0 y 1)
 */

/**
 * Enum Para las distintas funciones de Easing
 * @enum {easingFunction}
 * 
 */
XEngine.Easing = { //Todas las funciones de Easing
	Linear: function (t) {
		return t
	},
	QuadIn: function (t) {
		return t * t
	},
	QuadOut: function (t) {
		return t * (2 - t)
	},
	QuadInOut: function (t) {
		return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
	},
	CubicIn: function (t) {
		return t * t * t
	},
	CubicOut: function (t) {
		return (--t) * t * t + 1
	},
	CubicInOut: function (t) {
		return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
	},
	QuartIn: function (t) {
		return t * t * t * t
	},
	QuartOut: function (t) {
		return 1 - (--t) * t * t * t
	},
	QuartInOut: function (t) {
		return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
	},
	QuintIn: function (t) {
		return t * t * t * t * t
	},
	QuintOut: function (t) {
		return 1 + (--t) * t * t * t * t
	},
	QuintInOut: function (t) {
		return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
	},
	SinIn: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return Math.cos(t * Math.PI / 2);
	},
	SinOut: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return Math.sin(t * Math.PI / 2);
	},
	SinInOut: function (t) {
		if (t === 0) return 0;
		if (t === 1) return 1;
		return 0.5 * (1 - Math.cos(Math.PI * t))
	},
	ExpoIn: function (t) {
		return t === 0 ? 0 : Math.pow(1024, t - 1)
	},
	ExpoOut: function (t) {
		return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
	},
	ExpoInOut: function (t) {

		if (t === 0) return 0;
		if (t === 1) return 1;
		if ((t *= 2) < 1) return 0.5 * Math.pow(1024, t - 1);
		return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);

	},
	CircularIn: function (t) {
		return 1 - Math.sqrt(1 - t * t)
	},
	CircularOut: function (t) {
		return Math.sqrt(1 - (--t * t))
	},
	CircularInOut: function (t) {
		if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
		return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},
	/*ElasticIn: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
	},
	ElasticOut: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1);
	},
	ElasticInOut: function (t) {
		var s, a = 0.1,
			p = 0.4;
		if (t === 0) return 0;
		if (t === 1) return 1;
		if (!a || a < 1) {
			a = 1;
			s = p / 4;
		}
		else s = p * Math.asin(1 / a) / (2 * Math.PI);
		if ((t *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
	},*/
	BackIn: function (t) {
		var s = 1.70158;
		return t * t * ((s + 1) * t - s);
	},
	BackOut: function (t) {
		var s = 1.70158;
		return --t * t * ((s + 1) * t + s) + 1;
	},
	BackInOut: function (t) {
		var s = 1.70158 * 1.525;
		if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
		return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
	},
	BounceIn: function (t) {
		return 1 - XEngine.Easing.BounceOut(1 - t);
	},
	BounceOut: function (t) {
		if (t < (1 / 2.75)) {
			return 7.5625 * t * t;
		}
		else if (t < (2 / 2.75)) {
			return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
		}
		else if (t < (2.5 / 2.75)) {
			return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
		}
		else {
			return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
		}
	},
	BounceInOut: function (t) {
		if (t < 0.5) return XEngine.Easing.BounceIn(t * 2) * 0.5;
		return XEngine.Easing.BounceOut(t * 2 - 1) * 0.5 + 0.5;
	},
};

// ----------------------------------------- EVENTS ------------------------------------------//


/**
 * Objeto que almacena observadores para lanzar los eventos posteriormente
 * 
 * @class XEngine.Signal
 * @constructor
 */
XEngine.Signal = function () {
	/**
	 * @property {Array.<XEngine.SignalBinding>} bindings - Almacena todos los bindings que tiene el evento
	 * @readonly
	 */
	this.bindings = new Array(); //Listener que tiene la señal
};

XEngine.Signal.prototype = {

	/**
	 * añade un listener a este objeto
	 * @method XEngine.Signal#add
	 * @param {Function} listener - funcion a ejecutar
	 * @param {Object} listenerContext - contexto en el que se ejecuta la funcion
	 * @return {XEngine.Signal}
	 */
	add: function (listener, listenerContext) { //Añade un listener que siempre se ejecuta
		this.bindings.push(new XEngine.SignalBinding(this, listener, listenerContext, false));
	},

	/**
	 * añade un listener a este objeto que solo se ejecuta una vez
	 * @method XEngine.Signal#add
	 * @param {Function} listener - funcion a ejecutar
	 * @param {Object} listenerContext - contexto en el que se ejecuta la funcion
	 * @return {XEngine.Signal}
	 */
	addOnce: function (listener, listenerContext) {
		this.bindings.push(new XEngine.SignalBinding(this, listener, listenerContext, true));
	},

	/**
	 * Elimina un listener de los bindings
	 * @method XEngine.Signal#add
	 * @param {XEngine.SignalBinding} signalBinding - binding a eliminar
	 */
	_unBind: function (signalBinding) {
		var index = this.bindings.indexOf(signalBinding);
		delete this.bindings[index]; //Liberamos memoria
		this.bindings.splice(index, 1);
	},

	_destroy: function () { //Libera memoria
		delete this.bindings;
		this.bindings = new Array();
	},

	/**
	 * Lanza el evento a todos los listeners
	 * @method XEngine.Signal#dispatch
	 * @param {Object} args[] - sequencia de todos los parametros a ser enviados
	 */
	dispatch: function () {
		for (var i = this.bindings.length - 1; i >= 0; i--) {
			if (this.bindings[i] == null || this.bindings[i] == undefined) { //Si el binding ha dejado de existir, lo quitamos del array
				this.bindings.splice(i, 1);
			}
			this.bindings[i].dispatch.apply(this.bindings[i], arguments);
		}
	}
};

/**
  @callback signalCallback
 */

/**
 * Objeto que almacena un observador de una señal
 * 
 * @class XEngine.SignalBinding
 * @constructor
 * 
 * @param {XEngine.Signal} signal - referencia al objeto Signal
 * @param {signalCallback} listener - funcion a ejecutar
 * @param {*} listenerContext - contexto donde se ejecuta la funcion
 * @param {Boolean} [isOnce=false] - define si se debe ejecutar solo una vez
 */
XEngine.SignalBinding = function (signal, listener, listenerContext, isOnce) { //Objeto donde se almacena un listener
	/**
	 * @property {XEngine.Signal} signal - Referencia al objeto Signal
	 * @readonly
	 */
	this.signal = signal;
	/**
	 * @property {signalCallback} listener - funcion a ejecutar
	 * @readonly
	 */
	this.listener = listener;
	/**
	 * @property {*} listenerContext - contexto donde se ejecuta la funcion
	 * @readonly
	 */
	this.listenerContext = listenerContext;
	/**
	 * @property {Boolean} isOnce - define si se debe ejecutar solo una vez
	 * @readonly
	 */
	this.isOnce = isOnce || false;
};

XEngine.SignalBinding.prototype = {

	/**
	 * Lanza el evento al listener que tiene asignado
	 * @method XEngine.SignalBinding#dispatch
	 * @param {Object} args[] - sequencia de todos los parametros a ser enviados
	 */
	dispatch: function () {
		this.listener.apply(this.listenerContext, arguments);
		if (this.isOnce) {
			this.detach();
		}
	},

	/**
	 * Se elimina el listener del signal
	 * @method XEngine.SignalBinding#detach
	 */
	detach: function () {
		this.signal._unBind(this);
	}
};


// ----------------------------------------- MATHS ------------------------------------------//

/**
 * Funciones mátematicas que no están en la clase Math de JS
 * 
 * @class XEngine.Mathf
 * @static
 */
XEngine.Mathf = {};

/**
 * Devuelve un float aleatorio entre el rango especificado
 * @param {Number} min - Número mínimo que puede devolver (inclusivo)
 * @param {Number} max - Número máximo que puede devolver (exclusivo)
 * 
 * @example
 * // returns 8.93
 * XEngine.Mathf.randomRange(1, 9)
 * @returns {Number}
 */
XEngine.Mathf.randomRange = function (min, max) {
	return min + (Math.random() * (max - min)); //Obtiene un float random con el rango que se le asigna, min (inclusive) y max (exclusive)
};

/**
 * Devuelve un entero aleatorio entre el rango especificado
 * @param {Number} min - Número mínimo que puede devolver (inclusivo)
 * @param {Number} max - Número máximo que puede devolver (inclusivo)
 * 
 * @example
 * // returns 3
 * XEngine.Mathf.randomIntRange(1, 9)
 * @returns {Number}
 */
XEngine.Mathf.randomIntRange = function (min, max) { //Obtiene un float random con el rango que se le asigna, min (inclusive) y max (inclusive)
	return Math.round(min + Math.random() * (max - min));
};


/**
 * Devuelve el número indicado entre el máximo y el mínimo, si number < min devuelve min, si number > max devuelve max, en cualquier otro caso devuelve number
 * @param {Number} number - Número al que se le aplica el clamp
 * @param {Number} min - Número mínimo que puede devolver
 * @param {Number} max - Número máximo que puede devolver
 * 
 * @example
 * // returns 10
 * XEngine.Mathf.clamp(70, 4, 10)
 * 
 * // returns 5
 * XEngine.Mathf.clamp(5, 4, 10)
 * @returns {Number}
 */
XEngine.Mathf.clamp = function (number, min, max) { //Devuelve el número si está dentro de min o max, en caso contrario devuelve min o max
	return Math.max(Math.min(number, max), min);
};

/**
 * Interpolacion lineal entre dos numeros
 * @param {Number} a - color 1
 * @param {Number} b - color 2
 * @param {Number} amount - 0 devuelve a, 1 devuelve b, cualquier valor entre esos devuelve un número entre a y b
 * @example
 * // returns 5
 * XEngine.Mathf.lerpColor(0, 10, 0.5)
 * @returns {Number}
 */
XEngine.Mathf.lerp = function (a, b, t) { //Interpolación lineal
	t = XEngine.Mathf.clamp(t, 0, 1);
	return (1 - t) * a + t * b;
};

/**
 * Interpolacion lineal entre dos colores
 * @param {String} a - color 1
 * @param {String} b - color 2
 * @param {Number} amount - 0 devuelve a, 1 devuelve b, cualquier valor entre esos devuelve un color entre a y b
 * @example
 * // returns #7F7F7F
 * XEngine.Mathf.lerpColor('#000000', '#ffffff', 0.5)
 * @returns {String}
 */
XEngine.Mathf.lerpColor = function (a, b, amount) {

	var ah = parseInt(a.replace(/#/g, ''), 16),
		ar = ah >> 16,
		ag = ah >> 8 & 0xff,
		ab = ah & 0xff,
		bh = parseInt(b.replace(/#/g, ''), 16),
		br = bh >> 16,
		bg = bh >> 8 & 0xff,
		bb = bh & 0xff,
		rr = ar + amount * (br - ar),
		rg = ag + amount * (bg - ag),
		rb = ab + amount * (bb - ab);

	return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
};


/**
 * Objeto vector que almacena coordenadas
 * 
 * @class XEngine.Vector
 * @constructor
 * 
 * @param {Number} x - posición en el eje x
 * @param {Number} y - posición en el eje y
 */
XEngine.Vector = function (x, y) { //Vector de 2 dimensiones
	/**
	 * @property {Number} x - coordenada en X
	 * @public
	 */
	this.x = x;
	/**
	 * @property {Number} y - coordenada en Y
	 * @public
	 */
	this.y = y;
	/**
	 * @property {Number} z - coordenada en Z (dentro del motor solo se usa para los sprites en isométrica)
	 * @public
	 */
	this.z = 0;
	/**
	 * @property {Number} zOffset - Añade un offset al eje Z
	 * @public
	 */
	this.zOffset = 0;
};

/**
 * Devuelve un vector que es la resta de dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {XEngine.Vector}
 */
XEngine.Vector.sub = function (vector1, vector2) {
	var newVector = new XEngine.Vector(vector1.x, vector1.y, vector1.z);
	newVector.x -= vector2.x;
	newVector.y -= vector2.y;
	newVector.z -= vector2.z;
	return newVector;
};

/**
 * Devuelve un vector que es la suma de dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {XEngine.Vector}
 */
XEngine.Vector.add = function (vector1, vector2) {
	var newVector = new XEngine.Vector(vector1.x, vector1.y, vector1.z);
	newVector.x += vector2.x;
	newVector.y += vector2.y;
	newVector.z += vector2.z;
	return newVector;
};

/**
 * Devuelve la distancia entre dos vectores
 * @param {XEngine.Vector} vector1
 * @param {XEngine.Vector} vector2
 * @returns {Number}
 */
XEngine.Vector.distance = function (vector1, vector2) {
	var difference = XEngine.Vector.sub(vector1, vector2);
	return difference.length();
};


XEngine.Vector.prototype = {

	/**
	 * Asigna valores al vector
	 * @method XEngine.Vector#setTo
	 * 
	 * @param {Number} x - Valor en la coordenada X
	 * @param {Number} [y=x] - Valor en la coordenada Y
	 * @public
	 */
	setTo: function (x, y, z) { //Asigna los valores (solo por comodidad)
		this.x = x;
		if (y === undefined) y = x;
		this.y = y;
		if (z === undefined) z = x;
		this.z = z;
	},

	/**
	 * Suma a este vector los valores de otro
	 * @method XEngine.Vector#add
	 * 
	 * @param {XEngine.Vector} other - Vector a sumar
	 * @public
	 */
	add: function (other) { //Suma de vectores
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
	},

	/**
	 * Resta a este vector los valores de otro
	 * @method XEngine.Vector#sub
	 * 
	 * @param {XEngine.Vector} other - Vector a restar
	 * @public
	 */
	sub: function (other) { //Resta de vectores
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	},

	/**
	 * Multiplica a este vector los valores de otro
	 * @method XEngine.Vector#multiply
	 * 
	 * @param {XEngine.Vector} other - Vector a multiplicar
	 * @public
	 */
	multiply: function (other) { //Multiplicación de vectores
		this.x *= other.x;
		this.y *= other.y;
		this.y += other.z
		return this;
	},

	/**
	 * Normaliza el Vector (Ajusta las coordenadas para que la longitud del vector sea 1)
	 * @method XEngine.Vector#normalize
	 * @public
	 */
	normalize: function () { //Normalizar el vector
		var d = this.len();
		if (d > 0) {
			this.x = this.x / d;
			this.y = this.y / d;
			this.z = this.z / d;
		}
		return this;
	},

	/**
	 * Proyecta este vector en otro
	 * @method XEngine.Vector#project
	 * 
	 * @param {XEngine.Vector} other - Vector en el que proyectar
	 * @return {XEngine.Vector}
	 * @public
	 */
	project: function (other) { //Projectar el vector en otro
		var amt = this.dot(other) / other.len2();
		this.x = amt * other.x;
		this.y = amt * other.y;
		this.z = amt * other.z;
		return this;
	},

	/**
	 * Retorna el producto escalar del vector con otro vector
	 * @method XEngine.Vector#dot
	 * 
	 * @param {XEngine.Vector} other - Vector con el que hacer la operación
	 * @return {Number}
	 * @public
	 */
	dot: function (other) { //Producto escalar
		return this.x * other.x + this.y * other.y + this.z * other.z;
	},

	/**
	 * Escala el vector
	 * @method XEngine.Vector#scale
	 * 
	 * @param {Number} x - Valor en la coordenada X
	 * @param {Number} [y=x] - Valor en la coordenada Y
	 * @public
	 */
	scale: function (x, y, z) { //Escala del vector
		this.x *= x;
		this.y *= y || x;
		this.y *= z || x;
		return this;
	},

	/**
	 * Longitud del vector
	 * @method XEngine.Vector#length
	 * 
	 * @returns {Number}
	 * @public
	 */
	length: function () { //Longitud de un vector
		return Math.sqrt(this.len2());
	},

	/**
	 * Devuelve el cuadrado de la longitud
	 * @method XEngine.Vector#len2
	 * 
	 * @returns {Number}
	 * @public
	 */
	len2: function () { //Cuadrado de la longitud de un vector
		return this.dot(this);
	}
};

XEngine.Vector.prototype.constructor = XEngine.Vector;

// -------------------------------------------- INPUT--------------------------------------------//

/**
 * Manager que se encarga de manejar el input
 * 
 * @class XEngine.InputManager
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 */
XEngine.InputManager = function (game) { //Esto se explica solo
	this.game = game;
	/**
	 * @property {Array.<Boolean>} keysPressed - array en el que se almacenan si las teclas están pulsadas o no
	 * @readonly
	 */
	this.keysPressed = new Array();
	/**
	 * @property {XEngine.Signal} onKeyDown - evento que se llama cuando se aprieta una tecla. Se envía el objeto de evento de JS por defecto
	 * @readonly
	 */
	this.onKeyDown = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onKeyUp - evento que se llama cuando se levanta una tecla. Se envía el objeto de evento de JS por defecto
	 * @readonly
	 */
	this.onKeyUp = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onKeyPressed - evento que se llama cuando está apretada una tecla. Se envía el objeto de evento de JS por defecto
	 * @readonly
	 */
	this.onKeyPressed = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - evento que se llama cuando se hace click. Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onClick = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onInputDown - evento que se llama cuando se aprieta se baja el input (botón izquierdo de ratón). Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onInputDown = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onInputUp - evento que se llama cuando se suelta se baja el input (botón izquierdo de ratón). Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onInputUp = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onInputMove - evento que se llama cuando se mueve el input. Se envía un objeto con una propiedad 'position' que contiene x e y
	 * @readonly
	 */
	this.onInputMove = new XEngine.Signal();
	/**
	 * @property {Boolean} isDown - Determina si el input está apretado o no
	 * @readonly
	 */
	this.isDown = false;
	/**
	 * @property {XEngine.Vector} pointer - posición en la que se encuentra el input
	 * @readonly
	 */
	this.pointer = new XEngine.Vector(0, 0);
};

XEngine.InputManager.prototype = {
	
	
	initialize: function () {
	var _this = this;
	_this._initializeKeys();
	document.addEventListener('keydown', function (event) {
		_this.keyDownHandler.call(_this, event);
	});
	document.addEventListener('keyup', function (event) {
		_this.keyUpHandler.call(_this, event);
	});
	document.addEventListener('keypressed', function (event) {
		_this.keyPressedHandler.call(_this, event);
	});

	if (this.game.isMobile) {
		this.game.reference.addEventListener('touchstart', function (event) {
			_this.inputDownHandler.call(_this, event);
		});
		this.game.reference.addEventListener('touchend', function (event) {
			_this.inputUpHandler.call(_this, event);
		});
		this.game.reference.addEventListener('touchmove', function (event) {
			_this.inputMoveHandler.call(_this, event);
		});
	}
	else {
		this.game.reference.addEventListener('mousedown', function (event) {
			_this.inputDownHandler.call(_this, event);
		});
		this.game.reference.addEventListener('mouseup', function (event) {
			_this.inputUpHandler.call(_this, event);
		});
		this.game.reference.addEventListener('mousemove', function (event) {
			_this.inputMoveHandler.call(_this, event);
		});
		this.game.reference.addEventListener('click', function (event) {
			_this.clickHandler.call(_this, event);
		});
	}	
	},
	
	/**
	 * Inicializa el array de teclas apretadas
	 * @method XEngine.InputManager#_initializeKeys
	 * @private
	 */
	_initializeKeys: function () {
		for (var i = 0; i <= 222; i++) {
			this.keysPressed.push(false);
		}
	},
	/**
	 * Devuelve si una tecla está apretada
	 * @method XEngine.InputManager#isPressed
	 * 
	 * @param {Number} keyCode - Valor númerico de la tecla
	 * @returns {Boolean}
	 * @public
	 */
	isPressed: function (keyCode) {
		return this.keysPressed[keyCode];
	},

	/**
	 * callback interno que captura el evento de keydown
	 * @method XEngine.InputManager#keyDownHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	keyDownHandler: function (event) {
		this.keysPressed[event.keyCode] = true;
		this.onKeyDown.dispatch(event);
	},

	/**
	 * callback interno que captura el evento de keyup
	 * @method XEngine.InputManager#keyUpHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	keyUpHandler: function (event) {
		this.keysPressed[event.keyCode] = false;
		this.onKeyUp.dispatch(event);
	},

	/**
	 * callback interno que captura el evento de keyPressed
	 * @method XEngine.InputManager#keyPressedHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	keyPressedHandler: function (event) {
		this.onKeyPressed.dispatch(event);
	},

	/**
	 * callback interno que captura el evento de click
	 * @method XEngine.InputManager#clickHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	clickHandler: function (event) {
		var inputPos = this.getInputPosition(event);
		this.clickDispatcher(inputPos);
	},

	/**
	 * callback interno que captura el evento de inputDown
	 * @method XEngine.InputManager#inputDownHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	inputDownHandler: function (event) {
		this.isDown = true;
		var inputPos = this.getInputPosition(event);
		this.pointer.x = inputPos.position.x;
		this.pointer.y = inputPos.position.y;
		this.onInputDown.dispatch(inputPos);
		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					return loop(gameObject.children); //Si éste loop ha encontrado un objeto que hacer el input down, terminamos 
				}
				else {
					if (!gameObject.inputEnabled) continue;
					if (_this._pointerInsideBounds(gameObject)) {
						if (gameObject.onInputDown == undefined) {
							gameObject.onInputDown = new XEngine.Signal();
						}
						gameObject.onInputDown.dispatch(event);
						gameObject.isInputDown = true;
						return true;
					}
				}

			}
		};

		loop(this.game.gameObjects);
	},

	/**
	 * callback interno que captura el evento de inputMove
	 * @method XEngine.InputManager#inputMoveHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	inputMoveHandler: function (event) {

		var inputPos = this.getInputPosition(event);
		this.pointer.x = inputPos.position.x;
		this.pointer.y = inputPos.position.y;
		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					loop(gameObject.children);
				}
				else {
					if (!gameObject.inputEnabled) continue;
					if (_this._pointerInsideBounds(gameObject)) {
						if (!gameObject.isInputOver) {
							if (gameObject.onInputOver == undefined) {
								gameObject.onInputOver = new XEngine.Signal();
							}
							gameObject.onInputOver.dispatch(event);
							gameObject.isInputOver = true;
						}
					}
					else if (gameObject.isInputOver) {
						if (gameObject.onInputLeft == undefined) {
							gameObject.onInputLeft = new XEngine.Signal();
						}
						gameObject.onInputLeft.dispatch(event);
						gameObject.isInputOver = false;
					}
				}

			}
		};

		this.onInputMove.dispatch(inputPos);
		loop(this.game.gameObjects);
	},

	/**
	 * Dado un evento optiene la posición del puntero dentro del objeto canvas
	 * @method XEngine.InputManager#getInputPosition
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	getInputPosition: function (event) {
		var rect = this.game.reference.getBoundingClientRect();
		var newEvent = {
			position: {
				x: event.pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
				y: event.pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top
			},
		};

		if (this.game.isMobile) {
			newEvent = {
				position: {
					x: event.touches[0].pageX - (document.documentElement.scrollLeft || document.body.scrollLeft) - rect.left,
					y: event.touches[0].pageY - (document.documentElement.scrollTop || document.body.scrollTop) - rect.top
				}
			};
		}
		newEvent.position.x /= this.game.renderer.scale.x;
		newEvent.position.y /= this.game.renderer.scale.y;
		return newEvent;
	},

	/**
	 * callback interno que captura el evento de inputUp
	 * @method XEngine.InputManager#inputUpHandler
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	inputUpHandler: function (event) {
		this.isDown = false;
		var newEvent = {
			position: {
				x: this.pointer.x,
				y: this.pointer.y,
			},
		};
		if (this.game.isMobile) {
			this.clickDispatcher(newEvent);
		}
		this.onInputUp.dispatch(newEvent);

		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					loop(gameObject.children);
				}
				else {
					if (!gameObject.inputEnabled) continue;
					if (gameObject.isInputDown) {

						if (gameObject.onInputUp == undefined) {
							gameObject.onInputUp = new XEngine.Signal();
						}
						gameObject.onInputUp.dispatch(event);
						gameObject.isInputDown = false;
						return true;
					}
				}

			}
		};

		loop(this.game.gameObjects);
	},

	/**
	 * Dispatcher para lanzar el evento onClick tanto con pc como en Movil
	 * @method XEngine.InputManager#clickDispatcher
	 * 
	 * @param {JSInputEvent} event - evento de JS para el input
	 * @private
	 */
	clickDispatcher: function (event) {
		this.onClick.dispatch(event);
		var _this = this;
		var loop = function (array) { //Bucle que inspecciona todos los elementos de un Array
			for (var i = array.length - 1; i >= 0; i--) {
				var gameObject = array[i];
				if (XEngine.Group.prototype.isPrototypeOf(gameObject)) {
					if (loop(gameObject.children)) return true; //Si éste loop ha encontrado un objeto que hacer click, terminamos 
				}
				else {
					if (gameObject || gameObject.inputEnabled) {
						if (_this._pointerInsideBounds(gameObject)) { //Si el area el objeto está dentro del puntero, lanzamos el click y acabamos
							if (gameObject.onClick == undefined) {
								gameObject.onClick = new XEngine.Signal();
							}
							gameObject.onClick.dispatch(event);
							return true;
						}
					}
				}
			}
			return false;
		};
		loop(this.game.gameObjects);
	},

	/**
	 * Comprueba si el puntero está dentro del objeto que se le pasa por parámetro
	 * @method XEngine.InputManager#_pointerInsideBounds
	 * 
	 * @param {XEngine.BaseObject} gameObject - objeto a comprobar
	 * @private
	 */
	_pointerInsideBounds: function (gameObject) { //Obtenemos si el puntero está dentro del area de un objeto
		if (gameObject.getBounds != undefined) {
			var bounds = gameObject.getBounds();
			var worldPos = gameObject.getWorldPos();
			if (this.pointer.x < (worldPos.x - bounds.width * gameObject.anchor.x) || this.pointer.x > (worldPos.x + bounds.width * (1 - gameObject.anchor.x))) {
				return false;

			}
			else if (this.pointer.y < (worldPos.y - bounds.height * gameObject.anchor.y) || this.pointer.y > (worldPos.y + bounds.height * (1 - gameObject.anchor.y))) {
				return false;

			}
			else {
				return true;
			}
		}
		else {
			return false;
		}
	},

	/**
	 * Hace un resset de los eventos
	 * @method XEngine.InputManager#reset
	 * 
	 * @public
	 */
	reset: function () {
		this.onKeyUp._destroy();
		this.onKeyDown._destroy();
		this.onKeyPressed._destroy();
		this.onClick._destroy();
		this.onInputDown._destroy();
		this.onInputUp._destroy();
		this.onInputMove._destroy();
		this._initializeKeys();
	},
};

// ----------------------------------------- GAME OBJECTS ------------------------------------------//

/**
 * Objeto Básico del juego, todos los demás objetos que están en el juego heredan de este (Excepto el Audio)
 * 
 * @class XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 */
XEngine.BaseObject = function (game) { //De este objeto parten todos los objetos que se pueden poner en el juego
	var _this = this;
	_this.game = game; //Referencia al juego
	/**
	 * @property {Boolean} isPendingDestroy - determina si el objeto va a ser destruido en el siguiente frame
	 * @readonly
	 */
	_this.isPendingDestroy = false;
	/**
	 * @property {Boolean} alive - determina si el está vivo. En caso de que no lo esté, no se renderiza
	 * @readonly
	 */
	_this.alive = true;
	/**
	 * @property {Number} alpha - Ajusta el alpha con el que se pinta el objeto. 1 es opaco y 0 es transparente
	 * @public
	 */
	_this.alpha = 1.0;
	/**
	 * @property {XEngine.Vector} scale - Scala del objeto. 1 quiere decir que no se escala
	 * @public
	 */
	_this.scale = new XEngine.Vector(1, 1);
	/**
	 * @property {XEngine.Vector} anchor - Punto de anclaje. (0,0) = Arriba a la izquierda, (0,1) = Arriba a la derecha
	 * @public
	 */
	_this.anchor = new XEngine.Vector(0, 0); //Ancla del objeto (0,0) = Arriba a la izquierda
	/**
	 * @property {Number} rotation - Rotación (en grados) que tiene el objeto.
	 * @public
	 */
	_this.rotation = 0;
	/**
	 * @property {XEngine.Vector} position - Posición local del objeto
	 * @public
	 */
	_this.position = new XEngine.Vector(0, 0);
	/**
	 * @property {XEngine.Signal} onClick - Evento de click que se llama al hacer click sobre el objeto
	 * @reandonly
	 */
	_this.onClick = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input down
	 * @reandonly
	 */
	_this.onInputDown = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input up
	 * @reandonly
	 */
	_this.onInputUp = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input over
	 * @reandonly
	 */
	_this.onInputOver = new XEngine.Signal();
	/**
	 * @property {XEngine.Signal} onClick - Evento de input left
	 * @reandonly
	 */
	_this.onInputLeft = new XEngine.Signal();
	/**
	 * @property {Boolean} inputEnabled - determina si el objeto tiene que recibir input
	 * @public
	 */
	_this.inputEnabled = false;
	/**
	 * @property {Boolean} render - determina si el objeto se tiene que renderizar
	 * @public
	 */
	_this.render = true;
	/**
	 * @property {Boolean} render - determina si el objeto está fijo en la cámara
	 * @public
	 */
	_this.fixedToCamera = false;
	/**
	 * @property {Boolean} render - determina si el objeto tiene que estár dentro de coordenadas isometricas
	 * @public
	 */
	_this.isometric = false;
	/**
	 * @property {Boolean} isInputDown - determina si el objeto está siendo apretado
	 * @private
	 */
	_this.isInputDown = false;
};

XEngine.BaseObject.prototype = {
	
	/**
	 * Destruye el objeto
	 * @method XEngine.BaseObject#destroy
	 * 
	 * @public
	 */
	destroy: function () {
		this.kill();
		this.isPendingDestroy = true;
		if (this.onDestroy != undefined) {
			this.onDestroy();
		}
	},

	/**
	 * Mata el objeto pero no deja de existir en el juego (se puede "revivir")
	 * @method XEngine.BaseObject#kill
	 * 
	 * @public
	 */
	kill: function () {
		this.alive = false;
	},

	/**
	 * Devuelve este objeto al juego.
	 * @method XEngine.BaseObject#restore
	 * 
	 * @param {Number} posX - nueva posición en la coordenada X
	 * @param {Number} posY - nueva posición en la coordenada Y
	 * @public
	 */
	restore: function (posX, posY) {
		this.position.x = posX;
		this.position.x = posY;
		this.alive = true;
	},

	/**
	 * Devuelve la posición del objeto en coordenadas del mundo (tiene en cuenta la posición de los padres)
	 * @method XEngine.BaseObject#getWorldPos
	 * 
	 * @return {Number}
	 * @public
	 */
	getWorldPos: function () { //Obtiene la posición del objeto en el mundo teniendo en cuenta la posición local y la posición del mundo del padre
		var _this = this;
		var parentPos = _this.parent.getWorldPos();
		var x = _this.position.x + parentPos.x;
		var y = _this.position.y + parentPos.y;
		return {
			x: x,
			y: y
		};
	},

	/**
	 * Devuelve la rotación total del objeto (tiene en cuenta la rotación de los padres)
	 * @method XEngine.BaseObject#getWorldPos
	 * 
	 * @return {Number}
	 * @public
	 */
	getTotalRotation: function () { //Obtiene la rotación teniendo en cuenta la rotación de los padres
		var parentRot = this.parent.getTotalRotation();
		return parentRot + this.rotation;
	},
};

/**
 * Grupo de objetos. Es un contenedor donde poder controlar varios objetos a la vez
 * 
 * @class XEngine.Group
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} x - posición en x
 * @param {Number} y - posición en y
 */
XEngine.Group = function (game, x, y, z) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game;
	_this.children = new Array(); //Array de objetos contenidos
	_this.position.setTo(x, y, z);
	_this.position.z = 0;
};

XEngine.Group.prototypeExtends = {
	update: function (deltaTime) {
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para hacer su update
		{
			var gameObject = this.children[i];
			if (gameObject.isPendingDestroy) //Si es un objeto destruido lo eliminamos del array y liberamos memoria
			{
				if (gameObject.body != undefined) {
					gameObject.body.destroy();
				}
				delete this.children[i];
				this.children.splice(i, 1);
			}
			else if (gameObject.update != undefined && gameObject.alive) //En caso contrario miramos si contiene el método update y lo ejecutamos
			{
				gameObject.update(deltaTime);
			}
		}
	},

	getFirstDead: function () {
		for (var i = this.children.length - 1; i >= 0; i--) //Recorremos los objetos del grupo para encontrar alguno que esté "muerto"
		{
			var gameObject = this.children[i];
			if (!gameObject.alive) {
				return gameObject;
			}
		}
		return null;
	},

	getChildAtIndex: function (index) {
		return this.children[index];
	},

	childCount: function () {
		return this.children.length;
	},

	destroy: function () {
		this.kill();
		this.isPendingDestroy = true;
		for (var i = this.children.length - 1; i >= 0; i--) //Destruimos todos los hijos y liberamos memoria	
		{
			var gameObject = this.children[i];
			if (gameObject.destroy != undefined) {
				gameObject.destroy(gameObject);
				delete this.children[i];
			}
		}
		if (this.onDestroy != undefined) {
			this.onDestroy();
		}
	},

	add: function (gameObject) {
		if (this.game.gameObjects.indexOf(gameObject) >= 0) {
			var index = this.game.gameObjects.indexOf(gameObject);
			this.game.gameObjects.splice(index, 1);
		}
		this.children.push(gameObject);
		if (gameObject.start != undefined) {
			gameObject.start();
		}
		gameObject.parent = this;
		return gameObject;
	},
};
XEngine.Group.prototype = Object.create(XEngine.BaseObject.prototype);
Object.assign(XEngine.Group.prototype, XEngine.Group.prototypeExtends); //Se le añade el prototypeExtends al prototype original

/**
 * Objeto que define un texto
 * 
 * @class XEngine.Text
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} [text=""] - texto a mostrar
 * @param {object} [textStyle] - objeto que contiene los valores de estilo
 * 
 */
XEngine.Text = function (game, posX, posY, text, textStyle) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.game = game; //guardamos una referencia al juego
	_this.text = text || ""; //Set de los atributos del texto
	textStyle = textStyle || {};
	_this.font = textStyle.font || 'Arial';
	_this.size = textStyle.font_size || 12;
	_this.color = textStyle.font_color || 'white';
	_this.style = '';
	_this.strokeWidth = textStyle.stroke_width || 0;
	_this.strokeColor = textStyle.stroke_color || 'black';
	var canvas = game.canvas; //Ponemos los valores al canvas para objeter el width del texto
	canvas.save();
	canvas.font = _this.size + 'px ' + _this.font;
	var textSize = canvas.measureText(_this.text);
	canvas.restore(); //Restauramos los valores previos
	_this.width = textSize.width;
	_this.height = _this.size;
	_this.position.setTo(posX, posY);
};

//TODO pendiente de comentar a partir de aquí

XEngine.Text.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Text.prototypeExtends = {
	_renderToCanvas: function (canvas) {
		var _this = this;
		canvas.save();
		_this.applyRotationAndPos(canvas, _this.offSet);
		canvas.globalAlpha = _this.alpha;
		var font = font = _this.style + ' ' + _this.size + 'px ' + _this.font;
		canvas.font = font.trim();
		var textSize = canvas.measureText(_this.text);
		_this.width = textSize.width;
		_this.height = _this.size * 1.5;
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		var pos = {
			x: posX,
			y: posY + _this.size
		};
		if (_this.strokeWidth > 0) {
			canvas.strokeStyle = _this.strokeColor;
			canvas.lineWidth = _this.strokeWidth;
			canvas.strokeText(_this.text, pos.x, pos.y);
		}
		canvas.fillStyle = _this.color;
		canvas.fillText(_this.text, pos.x, pos.y);
		canvas.restore();
	},

	getBounds: function () {
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {
			width: width,
			height: height
		};
	},
};

Object.assign(XEngine.Text.prototype, XEngine.Text.prototypeExtends);

/**
 * Objeto que define un boton
 * 
 * @class XEngine.Button
 * @extends XEngine.BaseObject
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {Number} posX - posición en x
 * @param {Number} posY - posición en y
 * @param {String} sprite - nombre del sprite guardado en cache
 * @param {String} [spriteDown] - nombre del sprite guardado en cache para cuando se aprieta
 * @param {String} [spriteOver] - nombre del sprite guardado en cache ara cuando se pasa el ratón por encima
 * @param {String} [spriteUp] - nombre del sprite guardado en cache para cuando se suelta
 * 
 */
XEngine.Button = function (game, posX, posY, sprite, spriteDown, spriteOver, spriteUp) {
	XEngine.BaseObject.call(this, game);
	var _this = this;
	_this.spriteNormal = sprite;
	_this.spriteDown = spriteDown || sprite;
	_this.spriteOver = spriteOver || sprite;
	_this.spriteUp = spriteUp || sprite;
	_this.game = game; //guardamos una referencia al juego
	_this._swapSprite(sprite);
	_this.position.setTo(posX, posY);
	_this.inputEnabled = true;

	_this.onClick = new XEngine.Signal();

	_this.onInputDown.add(function () {
		_this._swapSprite(_this.spriteDown);
	}, this);

	_this.onInputOver.add(function () {
		if (!_this.isInputDown)
			_this._swapSprite(_this.spriteOver);
	}, this);

	_this.onInputLeft.add(function () {
		if (!_this.isInputDown)
			_this._swapSprite(_this.spriteNormal);
	}, this);

	_this.onInputUp.add(function () {
		_this.onClick.dispatch();
		if (!_this.isInputOver) {
			_this._swapSprite(_this.spriteUp);
		}
		else {
			_this._swapSprite(_this.spriteOver);
		}
	}, this);
};

XEngine.Button.prototype = Object.create(XEngine.BaseObject.prototype);

XEngine.Button.prototypeExtends = {

	_swapSprite: function (sprite) {
		var _this = this;
		_this.sprite = sprite;
		var new_image = _this.game.cache.image(_this.sprite).image;
		_this.width = new_image.width || 10; //Si la imagen no se ha cargado bien, ponemos valor por defecto
		_this.height = new_image.height || 10;
	},

	_renderToCanvas: function (canvas) { //Sobreescribimos el método render	
		var _this = this;
		canvas.save(); //Guardamos el estado actual del canvas
		var image = _this.game.cache.image(_this.sprite).image; //Obtenemos la imagen a renderizar
		this.applyRotationAndPos(canvas);
		canvas.globalAlpha = _this.alpha; //Aplicamos el alpha del objeto
		var posX = Math.round(-(_this.width * _this.anchor.x));
		var posY = Math.round(-(_this.height * _this.anchor.y));
		//Renderizamos la imagen teniendo en cuenta el punto de anclaje
		canvas.drawImage(image, posX, posY, _this.width, _this.height);
		canvas.restore(); //Restauramos el estado del canvas
	},

	getBounds: function () {
		var _this = this;
		var width = _this.width * _this.scale.x;
		var height = _this.height * _this.scale.y;
		return {
			width: width,
			height: height
		};
	},
};


Object.assign(XEngine.Button.prototype, XEngine.Button.prototypeExtends);


/**
 * Objeto que define un sonido
 * 
 * @class XEngine.Audio
 * @constructor
 * 
 * @param {XEngine.Game} game - referencia el objeto del juego
 * @param {String} audioName - nombre del sonido guardado en cache
 * @param {Boolean} [autoStart=false] - define si el sonido debe empezar al crearse
 * @param {Number} [volume=1] - define el volumen del audio
 * 
 */
XEngine.Audio = function (game, audioName, autoStart, volume) {
	var _this = this;
	_this.game = game;
	_this.isLoop = false;
	_this.audio = _this.game.cache.audio(audioName).audio;
	_this.persist = false;
	_this.volume = volume || 1;
	_this.onComplete = new XEngine.Signal();

	_this.completed = false;
	_this.pendingDestroy = false;
	_this.alive = true;
	if (autoStart) {
		this.play();
	}
};

XEngine.Audio.prototype = {
	update: function () {
		if (this.gainNode != null) {
			this.gainNode.gain.value = this.volume;
		}
	},

	play: function (time) {
		var _this = this;
		_this.source = _this.game.audioContext.createBufferSource();
		_this.source.buffer = _this.audio;
		_this.source.connect(_this.game.audioContext.destination);
		_this.source.onended = function () {
			_this._complete();
		};
		_this.gainNode = _this.game.audioContext.createGain();
		_this.source.connect(_this.gainNode);
		_this.gainNode.connect(_this.game.audioContext.destination);
		_this.gainNode.gain.value = _this.volume;
		this.source.loop = this.isLoop;
		_this.source.start(time || 0);
	},

	stop: function (time) {
		if (this.source)
			this.source.stop(time || 0);
	},

	loop: function (value) {
		this.isLoop = value;
	},

	destroy: function () {
		this.kill();
		this.pendingDestroy = true;
		if (this.onComplete) {
			this.onComplete._destroy();
			delete this.onComplete;
		}
	},

	kill: function () {
		this.alive = false;
		this.stop();
	},

	_complete: function () {
		var _this = this;
		this.stop();
		if (_this.onComplete) {
			_this.onComplete.dispatch();
		}
	}
};

/**
* Un KeyCode representa un botón físico del teclado
*
* @class XEngine.KeyCode
*/
XEngine.KeyCode = {
	/** @static */
	BACKSPACE: 8,
	/** @static */
	TAB: 9,
	/** @static */
	ENTER: 13,

	/** @static */
	SHIFT: 16,
	/** @static */
	CTRL: 17,
	/** @static */
	ALT: 18,

	/** @static */
	PAUSE: 19,
	/** @static */
	CAPS_LOCK: 20,
	/** @static */
	ESC: 27,
	/** @static */
	SPACE: 32,

	/** @static */
	PAGE_UP: 33,
	/** @static */
	PAGE_DOWN: 34,
	/** @static */
	END: 35,
	/** @static */
	HOME: 36,

	/** @static */
	LEFT: 37,
	/** @static */
	UP: 38,
	/** @static */
	RIGHT: 39,
	/** @static */
	DOWN: 40,

	/** @static */
	PRINT_SCREEN: 42,
	/** @static */
	INSERT: 45,
	/** @static */
	DELETE: 46,

	/** @static */
	ZERO: 48,
	/** @static */
	ONE: 49,
	/** @static */
	TWO: 50,
	/** @static */
	THREE: 51,
	/** @static */
	FOUR: 52,
	/** @static */
	FIVE: 53,
	/** @static */
	SIX: 54,
	/** @static */
	SEVEN: 55,
	/** @static */
	EIGHT: 56,
	/** @static */
	NINE: 57,

	/** @static */
	A: 65,
	/** @static */
	B: 66,
	/** @static */
	C: 67,
	/** @static */
	D: 68,
	/** @static */
	E: 69,
	/** @static */
	F: 70,
	/** @static */
	G: 71,
	/** @static */
	H: 72,
	/** @static */
	I: 73,
	/** @static */
	J: 74,
	/** @static */
	K: 75,
	/** @static */
	L: 76,
	/** @static */
	M: 77,
	/** @static */
	N: 78,
	/** @static */
	O: 79,
	/** @static */
	P: 80,
	/** @static */
	Q: 81,
	/** @static */
	R: 82,
	/** @static */
	S: 83,
	/** @static */
	T: 84,
	/** @static */
	U: 85,
	/** @static */
	V: 86,
	/** @static */
	W: 87,
	/** @static */
	X: 88,
	/** @static */
	Y: 89,
	/** @static */
	Z: 90,
	
	/** @static */
	PAD0: 96,
	/** @static */
	PAD1: 97,
	/** @static */
	PAD2: 98,
	/** @static */
	PAD3: 99,
	/** @static */
	PAD4: 100,
	/** @static */
	PAD5: 101,
	/** @static */
	PAD6: 102,
	/** @static */
	PAD7: 103,
	/** @static */
	PAD8: 104,
	/** @static */
	PAD9: 105,

	/** @static */
	F1: 112,
	/** @static */
	F2: 113,
	/** @static */
	F3: 114,
	/** @static */
	F4: 115,
	/** @static */
	F5: 116,
	/** @static */
	F6: 117,
	/** @static */
	F7: 118,
	/** @static */
	F8: 119,
	/** @static */
	F9: 120,
	/** @static */
	F10: 121,
	/** @static */
	F11: 122,
	/** @static */
	F12: 123,

	/** @static */
	SEMICOLON: 186,
	/** @static */
	PLUS: 187,
	/** @static */
	COMMA: 188,
	/** @static */
	MINUS: 189,
	/** @static */
	PERIOD: 190,
	/** @static */
	FORWAD_SLASH: 191,
	/** @static */
	BACK_SLASH: 220,
	/** @static */
	QUOTES: 222
};
