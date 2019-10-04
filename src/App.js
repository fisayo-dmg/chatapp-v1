import React from 'react';
import logo from './logo.svg';
import './App.css';
// import {ChatkitProvider, TokenProvider, withChatkit} from '@pusher/chatkit-client-react';
import Chatkit from '@pusher/chatkit-client';
import MessageList from './components/MessageList';
import SendMessageForm from './components/SendMessageForm';
import RoomList from './components/RoomList';
import NewRoomForm from './components/NewRoomForm'
import {tokenUrl, instanceLocator} from './config';

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      roomId: null,
      messages: [],
      joinableRooms: [],
      joinedRooms: []
    }
    this.sendMessage = this.sendMessage.bind(this);
    this.subscribeToRoom = this.subscribeToRoom.bind(this);
    this.getRooms = this.getRooms.bind(this);
  }

  componentDidMount(){
    const chatManager = new Chatkit.ChatManager({
      instanceLocator: instanceLocator,
      userId: 'dan',
      tokenProvider: new Chatkit.TokenProvider({
        url: tokenUrl
      })
    })

    chatManager.connect()
    .then(currentUser => {
      this.currentUser = currentUser;
      this.getRooms();
    })
    .catch(error => {
      console.error('error on connecting:', error);
    })
  }

  sendMessage(text){
    this.currentUser.sendMessage({
      text: text,
      roomId: this.state.roomId
    });
  }

  subscribeToRoom(roomId){
    this.setState({
      message: []
    })
    this.currentUser.subscribeToRoom({
      roomId: roomId,
      // messageLimit: 4,
      hooks: {
        onMessage: message => {
          this.setState((prevState) => ({
            messages: [...prevState.messages, message]
          }))
        }
      }
    }).then(room => {
      this.setState({
        roomId: room.id
      })
      this.getRooms();
    }).catch(err => console.log('error on subscribing to room: ', err))
  }

  getRooms(){
    this.currentUser.getJoinableRooms()
      .then(joinableRooms => {
        this.setState({
          joinableRooms: joinableRooms,
          joinedRooms: this.currentUser.rooms
        })
      }).catch(err => console.log('error on joinableRooms: ', err))
  }

  render(){
    return (
      <div className='app'>
        <RoomList roomId={this.state.roomId} subscribeToRoom={this.subscribeToRoom}
          rooms={[...this.state.joinableRooms, ...this.state.joinedRooms]}/>
        <MessageList messages={this.state.messages}/>
        <SendMessageForm sendMessage={this.sendMessage}/>
        <NewRoomForm />
      </div>
    )
  }
}

// const instanceLocator = 'v1:us1:ff901354-0ecf-471d-9389-4c50d1f1856a';
// const userId = 'dan';

// const tokenProvider = new TokenProvider({
//   url: 'https://us1.pusherplatform.io/services/chatkit_token_provider/v1/ff901354-0ecf-471d-9389-4c50d1f1856a/token'
// })

// function App() {
//   return (
//     <div className="App">
//       <ChatkitProvider
//         instanceLocator={instanceLocator}
//         tokenProvider={tokenProvider}
//         userId={userId}
//       >
//         <WelcomeMessage />
//       </ChatkitProvider>
//     </div>
//   );
// }

// // const WelcomeMessage = props => {
// //   return <div>Hello Chatkit!</div>
// // }

// const WelcomeMessage = withChatkit(props => {
//   return (
//     <div>
//       {props.chatkit.isLoading ? 'Connecting to Chatkit...' : `Hello ${props.chatkit.currentUser.name}!`}
//     </div>
//   )
// })

export default App;
