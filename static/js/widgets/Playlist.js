(function(){
	function UiPlaylist(config, layout){
		$Ui.call(this, config, true);
		(layout) || (this.basicLayout());
	};
	UiPlaylist.prototype = $O.f.xD($Ui.prototype, {
		constructor: UiPlaylist,
		basicLayout: function(){
			var div = document.createElement('div'),
				ul = document.createElement('ul');

			div.classList.add('playlist-header');
			$Ui.f.addClass(ul, ['playlist-ul', 'unstyled']);

			this._d.appendChild(div);
			this._d.appendChild(ul);

		},
		add: function(data){
			var li = document.createElement('li');
			li.innerHTML = window.render.orugaPlaylistItem(data);
			this.getElesByClass('playlist-ul', function(ele){ ele.appendChild(li) } );
		}
	});

	window.UiPlaylist = UiPlaylist;
})();
(function(){
	function UiPlaylistCreator(config, layout){
		UiPlaylist.call(this, config, true);
		(layout) || (this.basicLayout());
	};
	UiPlaylistCreator.prototype = $O.f.xD(UiPlaylist.prototype, {
		constructor: UiPlaylistCreator,
		basicLayout: function(){
			UiPlaylist.prototype.basicLayout.call(this);
			var form = document.createElement('form'),
				ul = this._d.getElementsByClassName('playlist-ul')[0],
				fieldSet = document.createElement('fieldset'),
				btnSubmit = document.createElement('button'),
				btnClear = document.createElement('button');

			$Ui.f.addClass(form, ['playlist-creator-form']);
			$Ui.f.addClass(fieldSet, ['playlist-creator-form-fieldset', 'no-show']);
			$Ui.f.addClass(btnSubmit, ['btn', 'btn-primary', 'playlist-creator-submit']);
			$Ui.f.addClass(btnClear, ['btn', 'playlist-creator-clear']);
			btnClear.addEventListener('click', this.onClear.bind(this), false);
			form.addEventListener('submit', this.onSubmit.bind(this), false);
			btnSubmit.setAttribute('type', 'submit');
			btnSubmit.innerHTML = "Enviar";
			btnClear.innerHTML = "Borrar";

			ul.parentNode.removeChild(ul);
			form.appendChild(ul);
			form.appendChild(fieldSet);
			form.appendChild(btnSubmit);
			form.appendChild(btnClear);
			this._d.appendChild(form);
		},
		add: function(data){
			switch(data.type){
				case "getSongs":
					UiPlaylist.prototype.add.call(this, data.value);
					var input = document.createElement('input');
					input.classList.add('no-show');
					input.setAttribute('type', 'hidden');
					input.setAttribute('name', 'song[]');
					input.setAttribute('value', JSON.stringify(data.value));
					this.getElesByClass('playlist-creator-form-fieldset', function(ele) { ele.appendChild(input);})
					
					break;
				case "getAlbums":
				case "getArtists":
					//TODO:
					break;
			}
		},
		onClear: function(){
			this.getElesByClass('playlist-ul', function(ele) { ele.innerHTML = "";})
			this.getElesByClass('playlist-creator-form-fieldset', function(ele) { ele.innerHTML = "";})
		},
		onSubmit: function(event){
			(event) && (event.preventDefault());
			var data = this.getElesByClass('playlist-creator-form', function(ele) { return $Ui.f.formSerialize(ele);}) || {};
			console.log(data);
			return false;
		}
	});

	window.UiPlaylistCreator = UiPlaylistCreator;
})();
