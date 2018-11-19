import React, { Component } from 'react';
import Webcam from "react-webcam";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { face: {} };
  }
  setCameraRef = webcam => {
    this.webcam = webcam;
  }
  getImage = async () => {
    const image = this.webcam.getScreenshot();
    const res = await fetch('/api/image', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: image })
    }).then(res => res.json());

    this.setState({ face: res});
  }
  getHeadYawDirection() {
    const roll = this.state.face.Pose.Yaw;
    if (roll > 10) return "left";
    if (roll < -10) return "right";
    return "center";
  }
  getHeadPitchDirection() {
    const roll = this.state.face.Pose.Pitch;
    if (roll > 10) return "up";
    if (roll < -10) return "down";
    return "level";
  }
  renderDetails() {
    if (Object.keys(this.state.face).length > 0) {
      return (
        <div>
          <h3>Eyes Open: {this.state.face.EyesOpen.Value ? "True" : "False"}</h3>
          <h3>Mouth Open: {this.state.face.MouthOpen.Value ? "True" : "False"}</h3>
          <h3>Head Direction: {this.getHeadYawDirection()}<small> ({this.state.face.Pose.Yaw.toFixed(2)})</small></h3>
          <h3>Head Pitch: {this.getHeadPitchDirection()}<small> ({this.state.face.Pose.Pitch.toFixed(2)})</small></h3>
        </div>
      );
    }

    return <h1>Take a photo</h1>
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Webcam audio={false} screenshotFormat="image/jpeg" ref={this.setCameraRef}/>
          <button onClick={this.getImage}>Capture</button>
          {this.renderDetails()}
        </header>
      </div>
    );
  }
}

export default App;
