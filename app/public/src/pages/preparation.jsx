import React, { Component } from 'react';
import Chat from './component/chat';
import firebase from 'firebase/app';
import PreparationMenu from './component/preparation-menu';
import { Redirect } from 'react-router-dom';

class Preparation extends Component {

    constructor(props){
        super(props);
        this.room = window._room;
        this.uid = firebase.auth().currentUser.uid;
        this.id = this.props.match.params.id;

        this.state = {
            messages: [],
            users: {},
            user:{},
            currentText: '',
            gameId: ''
        };

        this.room.onMessage('messages', (message) => {
            this.setState({
                messages: this.state.messages.concat(message)
            });
        });

        this.room.state.users.onAdd = (u) => {
            if(u.id == this.uid){
                this.setState({user: u});
            }
            u.onChange = changes =>{
                this.setState({users: this.room.state.users});
            }
            this.setState({users: this.room.state.users});
        };

        this.room.state.users.onRemove = (player, key) => {
            this.setState({users: this.room.state.users});
        };
    }

    handleSubmit (e) {
        e.preventDefault();
        this.sendMessage(this.state.currentText);
        this.setState({currentText: ""});
    }
    
    setCurrentText (e) {
        e.preventDefault();
        this.setState({ currentText: e.target.value });
    }

    sendMessage(payload){
        this.room.send('new-message', {'name': this.state.user.name, 'payload': payload, 'avatar':this.state.user.avatar });
    }

    addBot(){
        this.room.send('addBot');
    }

    removeBot(){
        this.room.send('removeBot');
    }

    toggleReady(){
        this.room.send('toggle-ready');
    }

    startGame(){
        firebase.auth().currentUser.getIdToken().then(token =>{
            let allUsersReady = true;

            this.room.state.users.forEach((user, key) => {
              if (!user.ready) {
                allUsersReady = false;
              }
            });
      
            if (allUsersReady) {
              window._client.create('game', {users: this.room.state.users, idToken: token}).then((room) => {
                window._room = room;
                this.setState({gameId: room.id});
                this.room.send('game-start', {id: room.id});
                this.room.leave();
              }).catch((e) => {
                console.error('join error', e);
              });
            }
        });
    }

  render() {

    if(this.state.gameId != ''){
        return <Redirect to={{
            pathname: '/game/' + this.state.gameId
        }} />;
    }

    else{
        return (
            <div className="App" style={{
                display:'flex',
                justifyContent:'space-between'
            }}>
                <PreparationMenu
                    id={this.id}
                    users={this.state.users}
                    addBot={this.addBot.bind(this)}
                    removeBot={this.removeBot.bind(this)}
                    toggleReady={this.toggleReady.bind(this)}
                    startGame={this.startGame.bind(this)}
                />
                <Chat 
                    messages={this.state.messages}
                    handleSubmit={this.handleSubmit.bind(this)} 
                    setCurrentText={this.setCurrentText.bind(this)}
                    currentText={this.state.currentText}
                />
            </div>
        );    
    }
  }
}
export default Preparation;