/** Objetos de ajax.
 *
 * @param url: string
 * @param config: Object {
 *    timeout: int miliseconds
 *    success: function()
 *    failure: function()
 *    startLoader: function() -> Funcion para setear cartelito de cargar
 *    endLoader: function() -> Funcion para parar cartelito de cargar
 *    method: string (POST/GET)
 *    contentType: 'application/x-www/form/urlencoded'
 *    data: (hash), data
 * }
 *
 * Eventos:
 *    readystate
 *    timeout
 */
function Ajax(url, config){
	$O.call(this, config);
	this.url = url;
	(typeof(this.c.timeout) == 'undefined') && (this.c.timeout = 5000);
	(typeof(this.c.success) != 'function') && (this.c.success = function(){});
	(typeof(this.c.failure) != 'function') && (this.c.failure = function(){});
	(typeof(this.c.startLoader) != 'function') && (this.c.startLoader = function(){});
	(typeof(this.c.endLoader) != 'function') && (this.c.endLoader = function(){});
	(this.c.method) || (this.c.method = 'GET');
	this.c.method = this.c.method.toUpperCase();
	(this.c.contentType) || (this.c.contentType = 'application/x-www-form-urlencoded');
	this.xhr = null;
	try{
		this.xhr = new XMLHttpRequest();
	} catch(e){
		try{
		}catch(e){
			this.xhr = new ActiveXObject("Msxml2.XMLHTTP");
		}
	}
	this.xhr.onreadystate = this.onReadyState.bind(this);
	this.xhr.open(this.c.method, this.url+ ( ( this.c.data && this.c.method == "GET")?"?"+this.objToString(this.c.data):''), true);
	this.c.startLoader.call(this);
	this.requestTimeout = setTimeout(this.onTimeout.bind(this), this.c.timeout);
	if(this.c.method == "POST" && this.c.data){
		this.xhr.setRequestHeader('Content-type', this.c.contentType);
		this.xhr.send(this.c.data);
	}else{
		this.xhr.send();
	}
}
(function(){
	Ajax.prototype = $0.f.xD($O.prototype, {
		onReadyState: function(){
			clearTimeout(this.requestTimeout);
			this.emit('readystate', this.xhr.responseText);
			if(this.xhr.status != 200)
				return this.c.failure.call(this, this.xhr.status, this.xhr.responseText, xhr);
			return this.c.success.call(this, this.xhr.responseText, xhr);
		},
		onTimeout: function(){
			this.emit('timeout');
			this.c.failure.call(this, 'timeout', '', this.xhr);
		},

		/** Transforam un hash en una lista de parametros de url
		 * @param Object or String
		 * @return String
		 */
		objToString: function(obj){
			if(typeof(obj) == 'string')
				return obj;

			var string = [];
			for(var key in obj){
				if(! obj.hasOwnProperty(key))
					continue;

				var ele = obj[key],
					k = encodeURIComponent(key);
				if(ele instanceof Array)
					for(var i=0, e;typeof(e = ele[i]) != 'undefined'; i++)
						string.push(k+"[]="+encodeURIComponent(e));
				else
					string.push(k+"="+encodeURIComponent(ele));
			}

			return string.join("&");
		}
	});
})();
