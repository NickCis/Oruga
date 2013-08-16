/** $O -> Objetos de Oruga
 * @param config -> Object, defaultea a un Hash vacio
 */
function $O(config){
	this._handlers = {};
	this.c = config || {};
};
(function(){
	/** Para agregar funciones de uso general
	 */
	$O.f = {
		/** Extender un prototipo.
		 * @param base: prototipo padre
		 * @param ext: prototipo hijo
		 * @return prototypo extendido
		 */
		xD: function(base, ext){
			var obj = Object.create(base);
			Object.getOwnPropertyNames(ext).forEach(function(p, i){
				Object.defineProperty(obj, p, Object.getOwnPropertyDescriptor(ext, p));
			});
			if(arguments.length > 2){
				for(var i=2; i < arguments.length; i++)
					obj = $O.prototype.f.xD(obj, arguments[i]);
			}
			return obj;
		}
	};
	
	$O.prototype = {
		/** Agregar un evento a escuchar.
		 * @param String <name> nombre de evento
		 * @param function <handler> cb del evento
		 */
		addEventListener: function(name, handler){
			if(!this._handlers[name])
				this._handlers[name] = [];

			this._handlers[name].push(handler);
		},
		/** Remueve un evento a escuchar.
		 * Si no se pasa handler remueve todos los handlers asociados a ese evento.
		 * @param String <name> nombre de evento
		 * @param function <handler> [cb del evento a remover]
		 */
		removeEventListener: function(name, handler){
			if(!handler)
				return delete this._handlers[name];

			var handlers = this._handlers[name],
				indx;
			if(!handlers || handlers.length == 0)
				return;

			while((indx = handlers.indexOf(handler)) > -1)
				handlers.splice(indx, 1);
		},
		/** Dispara un evento.
		 * @param String <name> nombre del evento
		 * @param Hash <extra> informacion que se agrega al evento enviado
		 */
		emit: function(name, extra){
			var handlers = this._handlers[name];
			if(!handlers)
				return;

			var event = {
				target: this,
				event: name
			};
			if(extra)
				for(var k in extra){
					if(!extra.hasOwnProperty(k))
						continue;
					event[k] = extra[k];
				}

			for(var i=0, h; h = handlers[i]; i++)
				h.call(this, event);
		},
		f : $O.f
	};
})();
