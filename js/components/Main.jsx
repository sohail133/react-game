import React from 'react';
import ReactDOM from 'react-dom';
import Header from './Header.jsx'

export default class Main extends React.Component {


  componentDidMount(){
    document.querySelector('#mainTheme').volume = 0.05;
    document.querySelector('#gameSounds').volume = 0.05;
  }

  render() {
    return <div className = 'container'>
      <Header/>
      { this.props.children }
      <audio id='gameSounds' src="/packs/media/sounds/lets_play.mp3"></audio>
      <audio id='mainTheme' src="/packs/media/sounds/main_theme.mp3" loop autoPlay></audio>
    </div>
  }
}
