//Para quitar warnings por las cosas que están en otro js
/* global XEngine*/

function initGame(){
   console.log('Arrancando El juego');
   var game = new XEngine.Game(1280, 720, 'contenedor');							//iniciamos el juego
   game.frameLimit = 120;
   game.state.add('space', CloudPoint);
   
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   
   game.state.start('space');
   
   game.setBackgroundColor('white');
}

var CloudPoint = function () {
	this.depthMultiplier = 2;
	this.startDistance = 1500;
};

CloudPoint.prototype = {
	
	preload: function () {
		this.game.load.texture('depth', 'tex/depthTexture.png');
		this.game.load.texture('color', 'tex/izquierdo.jpg');
	},
	
	start: function () {
		//Preparamos la camara en su posición
		this.game.camera.position.y = -250;
		
		//Velocidad de la camara
		this.velocity = new THREE.Vector3();
		
		//Configuramos el far de la camara
		this.game.camera.far = 1000000;
		
		//Obtenemos los datos de las imagenes
		var depthTexture = this.game.cache.texture('depth').texture;
		var colorTexture = this.game.cache.texture('color').texture;
		
		var depthData = getImageData(depthTexture.image);
		var colorData = getImageData(colorTexture.image);
		
		//Añadimos los controles
		this.controls = new THREE.PointerLockControls( this.game.camera );
		
		this.scene.add( this.controls.getObject() );
			
		//Creamos el objeto de geometría
		var geometry = new THREE.BufferGeometry();
		
		//Creamos un Array de posiciones
		var positions = new Float32Array( depthTexture.image.width * depthTexture.image.height * 3 );
		//Creamos un Array de colores
		var colors = new Float32Array( depthTexture.image.width * depthTexture.image.height * 3 );
		
		//Iteramos sobre todas las posiciones
		for(var i = 0; i< positions.length; i+=3){
			//Obtenemos la coordenada X e Y
			var x = (Math.floor(i / 3) % depthTexture.image.width);
			var y = Math.floor((i/3) / depthTexture.image.width);
			
			//Obtenemos la información de profundidad del pixel
			var depth = getPixel(depthData, x, y);
			depth = ((255 - depth.r) * this.depthMultiplier + this.startDistance);
			
			//Asignamos la posición al rededor de la posición 0 0 0
			var rads = x / depthTexture.image.width * Math.PI * 2;
			positions[ i ]     = Math.cos(rads) * depth;
			positions[ i + 1]     = -y
			positions[ i + 2]     = Math.sin(rads) * depth;
			
			//Obtenemos el  color del pixel
			var colData = getPixel(colorData, x, y);
			
			
			//Transformamos a valores entre 0 y 1
			var r = colData.r / 255;
			
			var g = colData.g / 255;
			
			var b = colData.b / 255;
			
			//

			//Asignamos los colores del pixel
			colors[ i ]     = r;
			colors[ i + 1 ] = g;
			colors[ i + 2 ] = b;
			
		}
		
		//Asignamos a la geometría las posiciones y los colores
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		geometry.computeBoundingSphere();
		
		//Creamos el material de los puntos
		var material = new THREE.PointsMaterial( { size: 6, vertexColors: THREE.VertexColors } );
		
		//Creamos los puntos a partir de la geometría
		var points = new THREE.Points( geometry, material );
		
		//Los añadimos a la escena
		this.scene.add( points );
		
		//Añadimos ventana de stats
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);
		
		//Iniciamos la funcionalidad de pointerLock
		this._initPointerLock();
	},
	
	_initPointerLock : function() {
        var _this = this;
        // Request pointer lock
        var canvas = this.game.reference;
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);

        // Event listener when the pointerlock is updated.
        var pointerlockchange = function (event) {
            _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.controls.enabled = false;
            } else {
                _this.controls.enabled = true;
            }
        };
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },
	
	update : function (deltaTime) {
		this.stats.update();
		//points.rotation.x = this.game.frameTime * 0.25 / 1000;
		//points.rotation.y = this.game.frameTime * 0.5 / 1000;
		
		this.velocity.x -= this.velocity.x * 7.0 * deltaTime;
		this.velocity.z -= this.velocity.z * 7.0 * deltaTime;
		
		if ( this.game.input.isPressed(XEngine.KeyCode.W) ) this.velocity.z -= 1400.0 * deltaTime;
		if ( this.game.input.isPressed(XEngine.KeyCode.S) ) this.velocity.z += 1400.0 * deltaTime;
		if ( this.game.input.isPressed(XEngine.KeyCode.A) ) this.velocity.x -= 1400.0 * deltaTime;
		if ( this.game.input.isPressed(XEngine.KeyCode.D) ) this.velocity.x += 1400.0 * deltaTime;
		
		this.controls.getObject().translateX( this.velocity.x * deltaTime );
		this.controls.getObject().translateY( this.velocity.y * deltaTime );
		this.controls.getObject().translateZ( this.velocity.z * deltaTime );

	},
};

function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );

}

function getPixel( imagedata, x, y ) {

    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };

}