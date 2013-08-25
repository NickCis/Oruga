(function(){
	/** $Ui -> Objetos de template
	 * @param config -> Object, defaultea a un Hash vacio
	*/
	function $Ui(config){
		$O.call(this, config);
		if(this.c.container)
			this._d = (typeof(this.c.container) == "string") ? document.getElementById(this.c.container) : this.c.container;
		this._d = this._d || document.createElement('div');
	};
	
	$Ui.f = {
		/** Serializa un Form
		 * @param Element : Form
		 * @param boolean true para string, false o nada para objeto
		 * @return Objeto o String de la form serializada
		 */
		formSerialize: function (form, string) {
			if (!form || form.nodeName !== "FORM") {
				return;
			}
			var i, j, q = [], ret = {};
			for (i = form.elements.length - 1; i >= 0; i = i - 1) {
				if (form.elements[i].name === "") {
					continue;
				}
				switch (form.elements[i].nodeName) {
					case 'INPUT':
						switch (form.elements[i].type) {
							case 'text':
							case 'hidden':
							case 'password':
							case 'button':
							case 'reset':
							case 'submit':
								q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
								ret[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
								break;
							case 'checkbox':
							case 'radio':
								if (form.elements[i].checked) {
									q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
									ret[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
								}
								break;
						}
						break;
					case 'file':
						break; 
					case 'TEXTAREA':
						q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
						ret[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
						break;
					case 'SELECT':
						switch (form.elements[i].type) {
							case 'select-one':
								q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
								ret[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
								break;
							case 'select-multiple':
								for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
									if (form.elements[i].options[j].selected) {
										q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
										ret[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
									}
								}
								break;
						}
						break;
					case 'BUTTON':
						switch (form.elements[i].type) {
							case 'reset':
							case 'submit':
							case 'button':
								q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
								ret[form.elements[i].name] = encodeURIComponent(form.elements[i].value);
								break;
						}
						break;
				}
			}
			return (string)? q.join("&") : ret;
		}
	};

	$Ui.prototype = $O.f.xD($O.prototype, {
		constructor: $Ui,
		getElesByClass: function(clss, cb){
			var eles = this._d.getElementsByClassName(clss),
				ret;
			if(eles.length){
				for(var i=0, ele; ele = eles[i]; i++){
					ret = cb.call(this, ele);
					if(ret !== undefined) return ret;
				}
			}
		},
		basicLayout: function(){ 
			$O.f.notImplemented.call(this, "basicLayout");
		}
	});

	window.$Ui = $Ui;
})();
