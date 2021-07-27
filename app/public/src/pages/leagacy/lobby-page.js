import {WORDS, XP_TABLE} from '../../../../models/enum';
import PokemonFactory from '../../../../models/pokemon-factory';

class LobbyPage {
  constructor(args) {
    this.room = args.room;
    this.maxCountPokemon = 0;
    this.maxCountMythical = 0;
    this.maxCountType = 0;
    if(args.allRooms){
      this.allRooms = args.allRooms;
    }
    else{
      this.allRooms = [];
    }

    this.typeColor = {
      NORMAL: '#9ca071',
      GRASS: '#71b951',
      FIRE: '#e17733',
      WATER: '#6781b3',
      ELECTRIC: '#f2cd3c',
      FIGHTING: '#ad2f29',
      PSYCHIC: '#df4f7c',
      DARK: '#7f6c5c',
      METAL: '#b0b1c3',
      GROUND: '#d6b965',
      POISON: '#a5549d',
      DRAGON: '#6f65a8',
      FIELD: '#94d1cb',
      MONSTER: '#448150',
      HUMAN: '#666666',
      AQUATIC: '#306e9f',
      BUG: '#9eb039',
      FLYING: '#9688b5',
      FLORA: '#845796',
      MINERAL: '#ad9a3c',
      AMORPH: '#7e69a0',
      FAIRY: '#e591a0',
      ICE: '#63c0e4'
    };

    this.langage = 'esp';
    if (window._client.auth.lang) {
      this.langage = window._client.auth.lang;
    }
    this.initializeRoom();

    this.render();
    this.addEventListeners();
  }

  addMessage(message) {
    // console.log(message);
    if (document.getElementById('messages')) {
      const messageHTML = document.createElement('section');
      messageHTML.className = 'message -left';
      messageHTML.style.display = 'flex';

      const balloonHTML = document.createElement('div');
      balloonHTML.className = 'nes-balloon from-left';
      balloonHTML.style.borderImageRepeat= 'unset';

      const messageContentHTML = document.createElement('p');
      messageContentHTML.style.fontSize = '10px';
      messageContentHTML.textContent = message.payload;
      balloonHTML.appendChild(messageContentHTML);
      /*
      const timeOfMessage = new Date(message.time);
      nameHTML.style.color = 'black';
      nameHTML.style.fontWeight = 'bold';
      nameHTML.textContent = `${timeOfMessage.getHours()}:${timeOfMessage.getMinutes()} - ${message.name} :`;
      */
      const imageHTML = document.createElement('img');
      imageHTML.src = `assets/avatar/${message.avatar}.png`;
      imageHTML.style.width = '50px';
      imageHTML.style.height = '50px';

      const hourHTML = document.createElement('p');
      const timeOfMessage = new Date(message.time);
      hourHTML. textContent = `${timeOfMessage.getHours()}:${timeOfMessage.getMinutes()}`;
      hourHTML.style.marginBottom ='0px;'

      const nameHTML = document.createElement('p');
      nameHTML.textContent = `${message.name}`;
      nameHTML.style.marginBottom ='0px;'
      nameHTML.style.fontSize = '10px';
      
      const detailHTML = document.createElement('div');
      detailHTML.style.display = 'flex';
      detailHTML.style.flexFlow = 'column';
      detailHTML.style.alignItems = 'center';

      detailHTML.appendChild(imageHTML);
      detailHTML.appendChild(nameHTML);
      detailHTML.appendChild(hourHTML);

      messageHTML.appendChild(detailHTML);
      messageHTML.appendChild(balloonHTML);
      document.getElementById('messages').appendChild(messageHTML);
      messageHTML.scrollIntoView();
    }
  }

  initializeRoom() {
    const self = this;
    this.room.state.messages.onAdd = (message, index) => {
      self.addMessage(message);
    };

    this.room.state.leaderboard.onAdd = (player, id) =>{
      if(player.rank >= 25){
        self.handleLeaderboardChange();
      }
    }

    this.room.state.pokemonLeaderboard.onAdd = (pokemon, id) =>{
      self.maxCountPokemon = Math.max(self.maxCountPokemon, pokemon.value);
    }

    this.room.state.mythicalPokemonLeaderboard.onAdd = (pokemon, id) =>{
      self.maxCountMythical = Math.max(self.maxCountMythical, pokemon.value);
    }

    this.room.state.typesLeaderboard.onAdd = (type, id) =>{
      self.maxCountType = Math.max(self.maxCountType, type.value);
    }

    this.room.state.users.onAdd = (user, id)=>{
      if(user.id == _client.auth._id){
        //console.log(`${user.name} (${user.elo})`);
        document.getElementById('player-title').textContent = `${user.name} (${user.elo})`;
      }
      self.handleUserListChange();
    }

    this.room.state.users.onRemove = (user, id)=>{
      self.handleUserListChange();
    }

    this.room.onMessage('rooms', (rooms) => {
      // console.log(rooms);
      rooms.forEach(room =>{
        if(room.name == 'room'){
          this.allRooms.push(room);
        }
      });
      this.handleRoomListChange();
    });

    this.room.onMessage('to-lobby', ()=>{
      this.room.leave();
      _client.auth.logout();
      window.dispatchEvent(new CustomEvent('render-home'));
    });

    this.room.onMessage('metadata', (metadata) => {
      _client.auth.metadata = metadata;
      // console.log(metadata);
      document.getElementById('avatarModal').src = `assets/avatar/${_client.auth.metadata.avatar}.png`;
      document.getElementById('avatar').src = `assets/avatar/${_client.auth.metadata.avatar}.png`;
    });

    this.room.onMessage('+', ([roomId, room]) => {
      if(room.name == 'room'){
        const roomIndex = this.allRooms.findIndex((room) => room.roomId === roomId);
        if (roomIndex !== -1) {
          this.allRooms[roomIndex] = room;
        } else {
          this.allRooms.push(room);
        }
        this.handleRoomListChange();
      }
    });

    this.room.onMessage('-', (roomId) => {
      this.allRooms = this.allRooms.filter((room) => room.roomId !== roomId);
      this.handleRoomListChange();
    });
  }

  render() {
    const self = this;
    let username = _client.auth.email.split('@')[0];
    //console.log(username);
    const content = document.createElement('div');
    content.setAttribute('id', 'lobby');
    content.style.padding = '10px';
    content.innerHTML = `
  <!-- Modal -->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
        <div style="display:flex;flex-flow:row;">
          <img style="width:50px;" id='avatarModal' src='assets/avatar/${_client.auth.metadata.avatar}.png'></img>
          <h4 id='player-title'>${username} (${_client.auth.metadata.elo})</h4>
        </div>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <h4>Level ${_client.auth.metadata.level} ${_client.auth.metadata.exp} / ${XP_TABLE[_client.auth.metadata.level]}</h4>
          <progress class="nes-progress" value="${_client.auth.metadata.exp}" max="${XP_TABLE[_client.auth.metadata.level]}"></progress>
          <h4>Wins (${_client.auth.metadata.wins})</h4>
          <progress class="nes-progress" value="${_client.auth.metadata.wins}" max="500"></progress>

          <h4>Avatar</h4>
          <table class="table">
          <tbody>
            <tr>
              <td><button class="invisibleButton" onclick=window.changeAvatar('rattata')><img src="assets/avatar/rattata.png" style="filter:grayscale(${_client.auth.metadata.level >= 0 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 0"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('pidgey')><img src="assets/avatar/pidgey.png" style="filter:grayscale(${_client.auth.metadata.level >= 1 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 1"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('spearow')><img src="assets/avatar/spearow.png" style="filter:grayscale(${_client.auth.metadata.level >= 2 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 2"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('caterpie')><img src="assets/avatar/caterpie.png" style="filter:grayscale(${_client.auth.metadata.level >= 3 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 3"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('weedle')><img src="assets/avatar/weedle.png" style="filter:grayscale(${_client.auth.metadata.level >= 4 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 4"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('igglybuff')><img src="assets/avatar/igglybuff.png" style="filter:grayscale(${_client.auth.metadata.level >= 5 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 5"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('seedot')><img src="assets/avatar/seedot.png" style="filter:grayscale(${_client.auth.metadata.level >= 6 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 6"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('zubat')><img src="assets/avatar/zubat.png" style="filter:grayscale(${_client.auth.metadata.level >= 7 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 7"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('sandshrew')><img src="assets/avatar/sandshrew.png" style="filter:grayscale(${_client.auth.metadata.level >= 8 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 8"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('pikachu')><img src="assets/avatar/pikachu.png" style="filter:grayscale(${_client.auth.metadata.level >= 9 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 9"></button></td>
            </tr>
            <tr>
              <td><button class="invisibleButton" onclick=window.changeAvatar('nidoranF')><img src="assets/avatar/nidoranF.png" style="filter:grayscale(${_client.auth.metadata.level >= 10 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 10"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('machop')><img src="assets/avatar/machop.png" style="filter:grayscale(${_client.auth.metadata.level >= 11 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 11"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('geodude')><img src="assets/avatar/geodude.png" style="filter:grayscale(${_client.auth.metadata.level >= 12 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 12"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('eevee')><img src="assets/avatar/eevee.png" style="filter:grayscale(${_client.auth.metadata.level >= 13 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 13"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('poliwag')><img src="assets/avatar/poliwag.png" style="filter:grayscale(${_client.auth.metadata.level >= 14 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 14"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('turtwig')><img src="assets/avatar/turtwig.png" style="filter:grayscale(${_client.auth.metadata.level >= 15 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 15"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('togepi')><img src="assets/avatar/togepi.png" style="filter:grayscale(${_client.auth.metadata.level >= 16 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 16"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('ralts')><img src="assets/avatar/ralts.png" style="filter:grayscale(${_client.auth.metadata.level >= 17 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 17"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('nidoranM')><img src="assets/avatar/nidoranM.png" style="filter:grayscale(${_client.auth.metadata.level >= 18 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 18"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('slakoth')><img src="assets/avatar/slakoth.png" style="filter:grayscale(${_client.auth.metadata.level >= 19 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 19"></button></td>
            </tr>
            <tr>
              <td><button class="invisibleButton" onclick=window.changeAvatar('growlithe')><img src="assets/avatar/growlithe.png" style="filter:grayscale(${_client.auth.metadata.level >= 20 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 20"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('numel')><img src="assets/avatar/numel.png" style="filter:grayscale(${_client.auth.metadata.level >= 21 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 21"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('abra')><img src="assets/avatar/abra.png" style="filter:grayscale(${_client.auth.metadata.level >= 22 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 22"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('horsea')><img src="assets/avatar/horsea.png" style="filter:grayscale(${_client.auth.metadata.level >= 23 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 23"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('gastly')><img src="assets/avatar/gastly.png" style="filter:grayscale(${_client.auth.metadata.level >= 24 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 24"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('mudkip')><img src="assets/avatar/mudkip.png" style="filter:grayscale(${_client.auth.metadata.level >= 25 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK[this.langage]} 25"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('trapinch')><img src="assets/avatar/trapinch.png" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 5 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('vibrava')><img src="assets/avatar/vibrava.png" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 10 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('flygon')><img src="assets/avatar/flygon.png" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 25 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 25 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('regirock')><img src="assets/avatar/regirock.png" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 100 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 100 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
            </tr>        
            <tr>
              <td><button class="invisibleButton" onclick=window.changeAvatar('bagon')><img src="assets/avatar/bagon.png" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 5 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('shelgon')><img src="assets/avatar/shelgon.png" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 10 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('salamence')><img src="assets/avatar/salamence.png" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 25 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 25 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('rayquaza')><img src="assets/avatar/rayquaza.png" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 100 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 100 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('spheal')><img src="assets/avatar/spheal.png" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 5 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('sealeo')><img src="assets/avatar/sealeo.png" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 10 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('walrein')><img src="assets/avatar/walrein.png" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 25 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 25 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('articuno')><img src="assets/avatar/articuno.png" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 100 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 100 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('bulbasaur')><img src="assets/avatar/bulbasaur.png" alt="" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 5 ? 0:1})" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('ivysaur')><img src="assets/avatar/ivysaur.png" alt="" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 10 ? 0:1})" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>
            </tr>
            <tr>
              <td><button class="invisibleButton" onclick=window.changeAvatar('venusaur')><img src="assets/avatar/venusaur.png" alt="" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 25 ? 0:1})" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 25 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('shaymin')><img src="assets/avatar/shaymin.png" alt="" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 100 ? 0:1})" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 100 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>    
              <td><button class="invisibleButton" onclick=window.changeAvatar('cyndaquil')><img src="assets/avatar/cyndaquil.png" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 5 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('quilava')><img src="assets/avatar/quilava.png" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 10 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('typlosion')><img src="assets/avatar/typlosion.png" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 25 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 25 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('entei')><img src="assets/avatar/entei.png" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 100 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 100 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('squirtle')><img src="assets/avatar/squirtle.png" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 5 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('wartortle')><img src="assets/avatar/wartortle.png" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 10 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('blastoise')><img src="assets/avatar/blastoise.png" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 25 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 25 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('kyogre')><img src="assets/avatar/kyogre.png" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 100 ? 0:1})" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 100 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
            </tr>
            <tr>
            <td><button class="invisibleButton" onclick=window.changeAvatar('meowth')><img src="assets/avatar/meowth.png" alt="" style="filter:grayscale(${_client.auth.metadata.donor ? 0:1})" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} ${WORDS.TIPEE_DONOR[this.langage]}"></button></td>
              <td><button class="invisibleButton" onclick=window.changeAvatar('persian')><img src="assets/avatar/persian.png" alt="" style="filter:grayscale(${_client.auth.metadata.donor ? 0:1})" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} ${WORDS.TIPEE_DONOR[this.langage]}"></button></td>
            </tr>
          </tbody>
        </table>
        <h4>Map Customization</h4>
        <p>Magma Cavern (${_client.auth.metadata.mapWin.FIRE})</p>
        <progress class="nes-progress is-error" value="${_client.auth.metadata.mapWin.FIRE}" max="100"></progress>
        <table class="table">
          <tbody>
            <tr>
              <td><button class="invisibleButton" onclick=window.changeMap('FIRE',0)><img src="assets/tiles/FIRE/FIRE0-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="Default map"></button></td>
              <td><button class="invisibleButton" onclick=window.changeMap('FIRE',1)><img src="assets/tiles/FIRE/FIRE1-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 5 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
              <td><button class="invisibleButton" onclick=window.changeMap('FIRE',2)><img src="assets/tiles/FIRE/FIRE2-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 10 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
              <td><button class="invisibleButton" onclick=window.changeMap('FIRE',3)><img src="assets/tiles/FIRE/FIRE3-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 20 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 20 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
              <td><button class="invisibleButton" onclick=window.changeMap('FIRE',4)><img src="assets/tiles/FIRE/FIRE4-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.FIRE >= 40 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 40 ${WORDS.WINS_IN[this.langage]} Magma Cavern"></button></td>
            </tr>
          </tbody>
        </table>
        <p>Frosty Forest (${_client.auth.metadata.mapWin.ICE})</p>
        <progress class="nes-progress is-primary" value="${_client.auth.metadata.mapWin.ICE}" max="100"></progress>
        <table class="table">
        <tbody>
          <tr>
            <td><button class="invisibleButton" onclick=window.changeMap('ICE',0)><img src="assets/tiles/ICE/ICE0-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="Default map"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('ICE',1)><img src="assets/tiles/ICE/ICE1-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 5 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('ICE',2)><img src="assets/tiles/ICE/ICE2-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 10 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('ICE',3)><img src="assets/tiles/ICE/ICE3-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 20 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 20 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('ICE',4)><img src="assets/tiles/ICE/ICE4-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.ICE >= 40 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 40 ${WORDS.WINS_IN[this.langage]} Frosty Forest"></button></td>
          </tr>
        </tbody>
        </table>
        <p>Glimmer Desert (${_client.auth.metadata.mapWin.GROUND})</p>
        <progress class="nes-progress is-warning" value="${_client.auth.metadata.mapWin.GROUND}" max="100"></progress>
        <table class="table">
        <tbody>
          <tr>
            <td><button class="invisibleButton" onclick=window.changeMap('GROUND',0)><img src="assets/tiles/GROUND/GROUND0-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="Default map"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GROUND',1)><img src="assets/tiles/GROUND/GROUND1-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 5 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GROUND',2)><img src="assets/tiles/GROUND/GROUND2-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 10 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GROUND',3)><img src="assets/tiles/GROUND/GROUND3-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 20 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 20 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GROUND',4)><img src="assets/tiles/GROUND/GROUND4-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GROUND >= 40 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 40 ${WORDS.WINS_IN[this.langage]} Glimmer Desert"></button></td>
          </tr>
        </tbody>
        </table>
        <p>Hidden Highland (${_client.auth.metadata.mapWin.GRASS})</p>
        <progress class="nes-progress is-success" value="${_client.auth.metadata.mapWin.GRASS}" max="100"></progress>
        <table class="table">
        <tbody>
          <tr>
            <td><button class="invisibleButton" onclick=window.changeMap('GRASS',0)><img src="assets/tiles/GRASS/GRASS0-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="Default map"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GRASS',1)><img src="assets/tiles/GRASS/GRASS1-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 5 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GRASS',2)><img src="assets/tiles/GRASS/GRASS2-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 10 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GRASS',3)><img src="assets/tiles/GRASS/GRASS3-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 20 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 20 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('GRASS',4)><img src="assets/tiles/GRASS/GRASS4-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.GRASS >= 40 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 40 ${WORDS.WINS_IN[this.langage]} Hidden Highland"></button></td>
          </tr>
        </tbody>
        </table>
        <p>Tiny Woods (${_client.auth.metadata.mapWin.NORMAL})</p>
        <progress class="nes-progress is-success" value="${_client.auth.metadata.mapWin.NORMAL}" max="100"></progress>
        <table class="table">
        <tbody>
          <tr>
            <td><button class="invisibleButton" onclick=window.changeMap('NORMAL',0)><img src="assets/tiles/NORMAL/NORMAL0-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="Default map"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('NORMAL',1)><img src="assets/tiles/NORMAL/NORMAL1-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 5 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('NORMAL',2)><img src="assets/tiles/NORMAL/NORMAL2-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 10 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('NORMAL',3)><img src="assets/tiles/NORMAL/NORMAL3-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 20 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 20 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('NORMAL',4)><img src="assets/tiles/NORMAL/NORMAL4-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.NORMAL >= 40 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 40 ${WORDS.WINS_IN[this.langage]} Tiny Woods"></button></td>
          </tr>
        </tbody>
        </table>
        <p>Stormy Sea (${_client.auth.metadata.mapWin.WATER})</p>
        <progress class="nes-progress is-primary" value="${_client.auth.metadata.mapWin.WATER}" max="100"></progress>
        <table class="table">
        <tbody>
          <tr>
            <td><button class="invisibleButton" onclick=window.changeMap('WATER',0)><img src="assets/tiles/WATER/WATER0-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" data-placement="right" title="Default map"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('WATER',1)><img src="assets/tiles/WATER/WATER1-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 5 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 5 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('WATER',2)><img src="assets/tiles/WATER/WATER2-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 10 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 10 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('WATER',3)><img src="assets/tiles/WATER/WATER3-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 20 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 20 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
            <td><button class="invisibleButton" onclick=window.changeMap('WATER',4)><img src="assets/tiles/WATER/WATER4-preview.png" alt="" class="img-thumbnail" data-toggle="tooltip" style="filter:grayscale(${_client.auth.metadata.mapWin.WATER >= 40 ? 0:1})" data-placement="right" title="${WORDS.UNLOCK_AFTER[this.langage]} 40 ${WORDS.WINS_IN[this.langage]} Stormy Sea"></button></td>
          </tr>
        </tbody>
        </table>
        </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">${WORDS.CLOSE[this.langage]}</button>
      </div>
      </div>
    </div>
  </div>

  <div style="display:flex; justify-content:space-between; margin-left:10px; margin-right:10px;"> 
    <div style="display:flex; justify-content:space-between;"> 
      <button type="button" class="nes-btn" id="button-home">${WORDS.HOME[this.langage]}</button>

      <div class="dropdown">
        <button style="margin-left:10px;" class="nes-btn is-error dropdown-toggle" type="button" id="leaderboardButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        ${WORDS.LEADERBOARD[this.langage]}
        </button>
          <div class="dropdown-menu" aria-labelledby="leaderboardButton">
            <a class="dropdown-item" href="#" id ="pokemon-button">
            Most played pokemon</a>
            <a class="dropdown-item" href="#" id ="mythical-button">
            Most played mythical</a>
            <a class="dropdown-item" href="#" id ="threeStars-button">
            Most played 3 stars pokemon</a>
            <a class="dropdown-item" href="#" id ="type-button">
            Most played type</a>
            <a class="dropdown-item" href="#" id ="leaderboard-button">
            Player Level</a>
            <a class="dropdown-item" href="#" id ="elo-bot-button">
            Leaderboard</a>
            <a class="dropdown-item" href="#" id ="elo-player-button">
            Bot Leaderboard</a>
            <a class="dropdown-item" href="#" id ="history-button">
            History</a>
          </div>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between;"> 

      <button type="button" class="nes-btn is-warning" data-toggle="modal" data-target="#exampleModal" style="margin-right:10px;">
      Profile
      </button>

      <div class="dropdown">
        <button class="nes-btn is-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <img src="assets/flags/${this.langage}.png"/>  
        ${WORDS.CHANGE_LANGAGE[this.langage]}
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item" href="#" id ="eng-button">
          <img src="assets/flags/eng.png"/>
          English</a>
          <a class="dropdown-item" href="#" id ="esp-button">
          <img src="assets/flags/esp.png"/>
          Español</a>
          <a class="dropdown-item" href="#" id ="fra-button">
          <img src="assets/flags/fra.png"/>
          Français</a>
        </div>
      </div>
    </div>
  </div>
  <div style="display:flex; justify-content:space-between; height:100%;"> 

    <div class="nes-container with-title is-centered" style="background-color: rgba(255, 255, 255, .6); margin:10px; padding:5px; width:30%; overflow-y: scroll;
    height: 90vh;">
      <div id='leaderboard-container'>
      <table style="border-spacing: 10px 0px; border-collapse:separate; width: 100%;">
        <thead>
            <tr>
                <th id='firstThTitle' colspan="2">${WORDS.LEADERBOARD[this.langage]}</th>
                <th id='secondThTitle'>${WORDS.PLAYER[this.langage]}</th>
                <th id='thirdThTitle'>${WORDS.LEVEL[this.langage]}</th>
            </tr>
        </thead>
        <tbody id="leaderboard-table">

        </tbody>
      </table>
      </div>
    </div>

    <div class="nes-container with-title is-centered" style="background-color: rgba(255, 255, 255, .6); margin:10px; width:30%; overflow-y: scroll;
    height: 90vh;">
      <div style="display:flex;flex-flow:row; justify-content: center;"><img style="width:50px;" id='avatar' src='assets/avatar/${_client.auth.metadata.avatar}.png'></img><p style='margin-left:10px;'>${username} (${_client.auth.metadata.elo})</p></div>
      <h3 style="margin:10px;">${WORDS.AVAILABLE_ROOM_IDS[this.langage]}:</h3>
      
      <div id="room-list" style="margin-top:10px; list-style: none;"></div>
      <button type="button" class="nes-btn is-success" id="create">${WORDS.CREATE_NEW_ROOM[this.langage]}</button>
    </div>

    <div class="nes-container with-title is-centered" style="background-color: rgba(255, 255, 255, .6); margin:10px; width: 10%; height: 90vh; overflow-y:scroll;">
      <div id='user-container'>

      </div>
    </div>

    <section class="nes-container" style="background-color: rgba(255, 255, 255, .6); margin:10px; overflow-y: scroll;
    height: 90vh; width:30%;">
    <section class="message-list" id="messages">
      </section>

      <div id='chat-container' style="display:flex; position:relative; bottom:10px; left:0px;">
      <div class="nes-field" style="width:78%; margin-right:2%;">
        <input type="text" id="inputMessage" class="nes-input" placeholder="${WORDS.TYPE_HERE[this.langage]}...">
      </div>
      <button type="button" class="nes-btn is-error" style="width:20%;" id="send">${WORDS.SEND[this.langage]}</button>
      </div>
    </section>
  </div>
`;
    document.body.innerHTML = '';
    document.body.appendChild(content);
    $(function() {
      $('[data-toggle="tooltip"]').tooltip();
    });
    this.handleRoomListChange();
    this.handleUserListChange();
    this.handleLeaderboardChange();
    this.room.state.messages.forEach((message, index) => {
      self.addMessage(message);
    });
  }

  addEventListeners() {
    // console.log(_client.auth.lang);
    const self = this;

    window.changeAvatar = function(pokemon) {
      self.room.send('avatar', {'pokemon': pokemon});
    };

    window.changeMap = function(map,index) {
      self.room.send('map', {'map': map, 'index':parseInt(index)});
    };

    window.historyClick = function(id){
      self.handleHistoryChange(id);
    };

    document.getElementById('button-home').addEventListener('click', (e) => {
      this.room.leave();
      _client.auth.logout();
      window.dispatchEvent(new CustomEvent('render-home'));
    });

    /*
    document.getElementById('button-creation-bot').addEventListener('click', (e) => {
      this.room.leave();
      _client.auth.logout();
      window.dispatchEvent(new CustomEvent('render-creation-bot'));
    });
    */
    document.getElementById('create').addEventListener('click', (e) => {
      this.createRoom();
    });
    

    document.getElementById('send').addEventListener('click', function() {
      self.sendMessage();
    });

    document.getElementById('inputMessage').addEventListener('keyup', function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        self.sendMessage();
      }
    });

    document.getElementById('eng-button').addEventListener('click', (e) => {
      window.dispatchEvent(new CustomEvent('switch-lang', {detail: {lang: 'eng', render: 'lobby', room: self.room, allRooms: self.allRooms}}));
    });

    document.getElementById('esp-button').addEventListener('click', (e) => {
      window.dispatchEvent(new CustomEvent('switch-lang', {detail: {lang: 'esp', render: 'lobby', room: self.room, allRooms: self.allRooms}}));
    });

    document.getElementById('fra-button').addEventListener('click', (e) => {
      window.dispatchEvent(new CustomEvent('switch-lang', {detail: {lang: 'fra', render: 'lobby', room: self.room, allRooms: self.allRooms}}));
    });

    document.getElementById('leaderboard-button').addEventListener('click', (e) => {
      self.handleLeaderboardChange();
    });

    document.getElementById('pokemon-button').addEventListener('click', (e) => {
      self.handleLeaderboardPokemonChange();
    });

    document.getElementById('mythical-button').addEventListener('click', (e) => {
      self.handleLeaderboardMythicalChange();
    });

    document.getElementById('type-button').addEventListener('click', (e) => {
      self.handleLeaderboardTypeChange();
    });

    document.getElementById('threeStars-button').addEventListener('click', (e) => {
      self.handleLeaderboardTheeStarsPokemonChange();
    });

    document.getElementById('elo-bot-button').addEventListener('click', (e) => {
      self.handleLeaderboardEloChange();
    });

    document.getElementById('elo-player-button').addEventListener('click', (e) => {
      self.handleLeaderboardEloBotChange();
    });

    document.getElementById('history-button').addEventListener('click', (e) => {
      self.handleHistoryChange(_client.auth._id);
    });
  }

  createRoom() {
    _client.create('room', {/* options */ }).then((room) => {
      this.room.leave();
      window.dispatchEvent(new CustomEvent('render-room', {detail: {room: room}}));
    }).catch((e) => {
      console.error('join error', e);
      alert(e);
    });
  }

  joinRoomById(id) {
    if (id === '') return;
    _client.joinById(id).then((room) => {
      this.room.leave();
      window.dispatchEvent(new CustomEvent('render-room', {detail: {room: room}}));
    }).catch((e) => {
      console.error('join error', e);
      alert(e);
    });
  }

  sendMessage() {
    if (document.getElementById('inputMessage').value != '') {
      this.room.send('new-message', {'name': _client.auth.email, 'payload': document.getElementById('inputMessage').value, 'avatar': _client.auth.metadata.avatar});
      document.getElementById('inputMessage').value = '';
    }
  }

  handleUserListChange(){
    if(document.getElementById('user-container')){
      document.getElementById('user-container').innerHTML = '';
      this.room.state.users.forEach(user => {
        const userHTML = document.createElement('button');
        userHTML.addEventListener('click',e=>{
          window.historyClick(user.id);
        });
        userHTML.className = 'invisibleButton';
        userHTML.style.display = 'flex';
        userHTML.style.flexFlow = 'column';
        userHTML.style.alignItems = 'center';
        userHTML.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAzElEQVRYR+2X0Q6AIAhF5f8/2jYXZkwEjNSVvVUjDpcrGgT7FUkI2D9xRfQETwNIiWO85wfINfQUEyxBG2ArsLwC0jioGt5zFcwF4OYDPi/mBYKm4t0U8ATgRm3ThFoAqkhNgWkA0jJLvaOVSs7j3qMnSgXWBMiWPXe94QqMBMBc1VZIvaTu5u5pQewq0EqNZvIEMCmxAawK0DNkay9QmfFNAJUXfgGgUkLaE7j/h8fnASkxHTz0DGIBMCnBeeM7AArpUd3mz2x3C7wADglA8BcWMZhZAAAAAElFTkSuQmCC) 14 0, pointer';
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/avatar/${user.avatar}.png`;
        const nameHTML = document.createElement('p');
        nameHTML.style.fontSize = '10px';
        nameHTML.textContent = `${user.name} (${user.elo})`;
        userHTML.appendChild(imageHTML);
        userHTML.appendChild(nameHTML);
        document.getElementById('user-container').appendChild(userHTML);
      });
    }
  }

  handleHistoryChange(playerId){
    document.getElementById('firstThTitle').textContent = 'Team';
    document.getElementById('secondThTitle').textContent = 'Rank/Elo';
    document.getElementById('thirdThTitle').textContent = 'Date';
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      document.getElementById('leaderboard-table').style.borderSpacing = '15px 5px';
      this.room.state.users.get(playerId).history.forEach(record =>{
        const recordHTML = document.createElement('tr');

        const timeHTML = document.createElement('td');
        let jsdate = new Date(record.time);
        const dateHTML = document.createElement('span');
        dateHTML.textContent = jsdate.toLocaleDateString()

        const hourHTML = document.createElement('span');
        hourHTML.textContent = `${jsdate.getHours()}:${jsdate.getMinutes()}`;
        timeHTML.appendChild(dateHTML);
        timeHTML.appendChild(document.createElement('br'));
        timeHTML.appendChild(hourHTML);

        const teamHTML = document.createElement('td');
        teamHTML.style.display = 'flex';
    
        record.pokemons.forEach(pokemon => {
          let pokemonImage = document.createElement('img');
          pokemonImage.src = `assets/avatar/${pokemon}.png`;
          pokemonImage.style.width = '40px';
          pokemonImage.style.height = '40px';
          teamHTML.appendChild(pokemonImage);
        });

        const rankHTML = document.createElement('td');
        rankHTML.textContent = record.rank;

        const eloHTML = document.createElement('td');
        eloHTML.textContent = record.elo;

        
        recordHTML.appendChild(teamHTML);
        recordHTML.appendChild(rankHTML);
        recordHTML.appendChild(eloHTML);
        recordHTML.appendChild(timeHTML);

        document.getElementById('leaderboard-table').appendChild(recordHTML);
      });
    }
  }

  handleLeaderboardEloChange(){
    document.getElementById('firstThTitle').textContent = WORDS.LEADERBOARD[this.langage];
    document.getElementById('secondThTitle').textContent = 'Player';
    document.getElementById('thirdThTitle').textContent = 'Elo';
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      this.room.state.playerEloLeaderboard.forEach(player =>{
        const playerHTML = document.createElement('tr');

        const rankHTML = document.createElement('td');
        rankHTML.textContent = player.rank;

        const avatarHTML = document.createElement('td');
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/avatar/${player.avatar}.png`;
        avatarHTML.appendChild(imageHTML);

        const nameHTML = document.createElement('td');
        nameHTML.textContent = player.name.slice(0,10);

        const levelHTML = document.createElement('td');
        levelHTML.textContent = player.value;

        playerHTML.appendChild(rankHTML);
        playerHTML.appendChild(avatarHTML);
        playerHTML.appendChild(nameHTML);
        playerHTML.appendChild(levelHTML);

        document.getElementById('leaderboard-table').appendChild(playerHTML);
      });
    }
  }

  handleLeaderboardEloBotChange(){
    document.getElementById('firstThTitle').textContent = WORDS.LEADERBOARD[this.langage];
    document.getElementById('secondThTitle').textContent = 'Bot';
    document.getElementById('thirdThTitle').textContent = 'Elo';
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      this.room.state.botEloLeaderboard.forEach(player =>{
        const playerHTML = document.createElement('tr');

        const rankHTML = document.createElement('td');
        rankHTML.textContent = player.rank;

        const avatarHTML = document.createElement('td');
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/avatar/${player.avatar}.png`;
        avatarHTML.appendChild(imageHTML);

        const nameHTML = document.createElement('td');
        nameHTML.textContent = player.name.slice(0,10);

        const levelHTML = document.createElement('td');
        levelHTML.textContent = player.value;

        playerHTML.appendChild(rankHTML);
        playerHTML.appendChild(avatarHTML);
        playerHTML.appendChild(nameHTML);
        playerHTML.appendChild(levelHTML);

        document.getElementById('leaderboard-table').appendChild(playerHTML);
      });
    }
  }

  handleLeaderboardPokemonChange(){
    document.getElementById('firstThTitle').textContent = WORDS.LEADERBOARD[this.langage];
    document.getElementById('secondThTitle').textContent = 'Pokemon';
    document.getElementById('thirdThTitle').textContent = 'Count';
    
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      this.room.state.pokemonLeaderboard.forEach(pokemon =>{
        let colyseusPokemon = PokemonFactory.createPokemonFromName(pokemon.name);
        const playerHTML = document.createElement('tr');

        const rankHTML = document.createElement('td');
        rankHTML.textContent = pokemon.rank;

        const avatarHTML = document.createElement('td');
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/avatar/${pokemon.name}.png`;
        avatarHTML.appendChild(imageHTML);

        const nameHTML = document.createElement('td');
        nameHTML.textContent = pokemon.name;

        const levelHTML = document.createElement('td');
        levelHTML.style.display = 'block';
        levelHTML.style.height = '30px';
        //console.log(colyseusPokemon.types[0]);
        levelHTML.style.backgroundColor = this.typeColor[colyseusPokemon.types[0]];
        levelHTML.style.width = `${pokemon.value * 100/this.maxCountPokemon}%`;
        levelHTML.textContent = pokemon.value;

        playerHTML.appendChild(rankHTML);
        playerHTML.appendChild(avatarHTML);
        playerHTML.appendChild(nameHTML);
        playerHTML.appendChild(levelHTML);

        document.getElementById('leaderboard-table').appendChild(playerHTML);
      });
    }
  }

  handleLeaderboardMythicalChange(){
    document.getElementById('firstThTitle').textContent = WORDS.LEADERBOARD[this.langage];
    document.getElementById('secondThTitle').textContent = 'Pokemon';
    document.getElementById('thirdThTitle').textContent = 'Count';
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      this.room.state.mythicalPokemonLeaderboard.forEach(pokemon =>{
        let colyseusPokemon = PokemonFactory.createPokemonFromName(pokemon.name);
        const playerHTML = document.createElement('tr');

        const rankHTML = document.createElement('td');
        rankHTML.textContent = pokemon.rank;

        const avatarHTML = document.createElement('td');
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/avatar/${pokemon.name}.png`;
        avatarHTML.appendChild(imageHTML);

        const nameHTML = document.createElement('td');
        nameHTML.textContent = pokemon.name;

        const levelHTML = document.createElement('td');
        levelHTML.style.display = 'block';
        levelHTML.style.height = '30px';
        //console.log(colyseusPokemon.types[0]);
        levelHTML.style.backgroundColor = this.typeColor[colyseusPokemon.types[0]];
        levelHTML.style.width = `${pokemon.value * 100/this.maxCountMythical}%`;
        levelHTML.textContent = pokemon.value;

        playerHTML.appendChild(rankHTML);
        playerHTML.appendChild(avatarHTML);
        playerHTML.appendChild(nameHTML);
        playerHTML.appendChild(levelHTML);

        document.getElementById('leaderboard-table').appendChild(playerHTML);
      });
    }
  }

  handleLeaderboardTypeChange(){
    document.getElementById('firstThTitle').textContent = WORDS.LEADERBOARD[this.langage];
    document.getElementById('secondThTitle').textContent = 'Type';
    document.getElementById('thirdThTitle').textContent = 'Count';
    
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      this.room.state.typesLeaderboard.forEach(type =>{
        const playerHTML = document.createElement('tr');

        const rankHTML = document.createElement('td');
        rankHTML.textContent = type.rank;

        const avatarHTML = document.createElement('td');
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/types/${type.name}.png`;
        avatarHTML.appendChild(imageHTML);

        const nameHTML = document.createElement('td');
        nameHTML.textContent = type.name;

        const levelHTML = document.createElement('td');
        levelHTML.style.display = 'block';
        levelHTML.style.height = '30px';
        //console.log(colyseusPokemon.types[0]);
        levelHTML.style.backgroundColor = this.typeColor[type.name];
        levelHTML.style.width = `${type.value * 100/this.maxCountType}%`;
        levelHTML.textContent = type.value;

        playerHTML.appendChild(rankHTML);
        playerHTML.appendChild(avatarHTML);
        playerHTML.appendChild(nameHTML);
        playerHTML.appendChild(levelHTML);

        document.getElementById('leaderboard-table').appendChild(playerHTML);
      });
    }
  }

  handleLeaderboardTheeStarsPokemonChange(){
    document.getElementById('firstThTitle').textContent = WORDS.LEADERBOARD[this.langage];
    document.getElementById('secondThTitle').textContent = 'Pokemon';
    document.getElementById('thirdThTitle').textContent = 'Count';
    
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      this.room.state.threeStarsLeaderboard.forEach(pokemon =>{
        let colyseusPokemon = PokemonFactory.createPokemonFromName(pokemon.name);
        const playerHTML = document.createElement('tr');

        const rankHTML = document.createElement('td');
        rankHTML.textContent = pokemon.rank;

        const avatarHTML = document.createElement('td');
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/avatar/${pokemon.name}.png`;
        avatarHTML.appendChild(imageHTML);

        const nameHTML = document.createElement('td');
        nameHTML.textContent = pokemon.name;

        const levelHTML = document.createElement('td');
        levelHTML.style.display = 'block';
        levelHTML.style.height = '30px';
        //console.log(colyseusPokemon.types[0]);
        levelHTML.style.backgroundColor = this.typeColor[colyseusPokemon.types[0]];
        levelHTML.style.width = `${pokemon.value * 100/this.maxCountPokemon}%`;
        levelHTML.textContent = pokemon.value;

        playerHTML.appendChild(rankHTML);
        playerHTML.appendChild(avatarHTML);
        playerHTML.appendChild(nameHTML);
        playerHTML.appendChild(levelHTML);

        document.getElementById('leaderboard-table').appendChild(playerHTML);
      });
    }
  }

  handleLeaderboardChange(){
    document.getElementById('firstThTitle').textContent = WORDS.LEADERBOARD[this.langage];
    document.getElementById('secondThTitle').textContent = 'Player';
    document.getElementById('thirdThTitle').textContent = 'level';
    if(document.getElementById('leaderboard-container')){
      document.getElementById('leaderboard-table').innerHTML = '';
      this.room.state.leaderboard.forEach(player =>{
        const playerHTML = document.createElement('tr');

        const rankHTML = document.createElement('td');
        rankHTML.textContent = player.rank;

        const avatarHTML = document.createElement('td');
        const imageHTML = document.createElement('img');
        imageHTML.src = `assets/avatar/${player.avatar}.png`;
        avatarHTML.appendChild(imageHTML);

        const nameHTML = document.createElement('td');
        nameHTML.textContent = player.name.slice(0,10);

        const levelHTML = document.createElement('td');
        levelHTML.textContent = player.value;

        playerHTML.appendChild(rankHTML);
        playerHTML.appendChild(avatarHTML);
        playerHTML.appendChild(nameHTML);
        playerHTML.appendChild(levelHTML);

        document.getElementById('leaderboard-table').appendChild(playerHTML);
      });
    }
  }

  handleRoomListChange() {
    if (document.getElementById('room-list')) {
      document.getElementById('room-list').innerHTML = '';
      this.allRooms.forEach((room) => {
        if (room.name != 'game') {
          const nesContainer = document.createElement('div');
          nesContainer.style.marginTop = '20px';
          nesContainer.style.marginBottom = '20px';
          nesContainer.className = 'nes-container with-title is-centered';

          const infoContainer = document.createElement('div');
          infoContainer.style.display = 'flex';
          infoContainer.style.justifyContent = 'space-around';

          const title = document.createElement('p');
          title.className = 'title';
          title.textContent = `Room id : ${room.roomId}`;

          const content = document.createElement('h3');
          content.style.marginTop = '15px';
          content.textContent = `${room.clients} / ${room.maxClients}`;

          const button = document.createElement('button');
          button.textContent = 'Join';
          button.className = 'nes-btn is-warning';
          button.addEventListener('click', () => {
            this.joinRoomById(room.roomId);
          });

          infoContainer.appendChild(content);
          infoContainer.appendChild(button);
          nesContainer.appendChild(title);
          nesContainer.appendChild(infoContainer);

          document.getElementById('room-list').appendChild(nesContainer);
        }
      });
    }
  }
}

export default LobbyPage;