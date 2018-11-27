import React, { Component } from 'react';
import Webcam from "react-webcam";
import './App.css';
import { async } from 'rsvp';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { face: {}, initialPose: {} };
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

  calibrate = async () => {
    await this.getImage();
    this.setState({ initialPose: this.state.face.Pose})
    console.log(this.state.face.Pose);
  }

  getHeadYawDirection() {
    const yaw = this.state.face.Pose.Yaw;
    if (yaw > (this.state.initialPose.Yaw + 10)) return "left";
    if (yaw < (this.state.initialPose.Yaw - 10)) return "right";
    return "center";
  }
  getHeadPitchDirection() {
    const pitch = this.state.face.Pose.Pitch;
    if (pitch > (this.state.initialPose.Pitch + 10)) return "up";
    if (pitch < (this.state.initialPose.Pitch - 10)) return "down";
    return "level";
  }
  getAction() {
    // if (!this.state.face.EyesOpen.Value) return 'Click';
    if (this.getHeadPitchDirection() !== 'level') return `Scroll ${this.getHeadPitchDirection()}`;
    if (this.getHeadYawDirection() !== 'center') return `Navigate ${this.getHeadYawDirection()}`;
    return 'None';
  }

  renderDetails() {
    if (Object.keys(this.state.face && this.state.initialPose).length > 0) {
      return (
        <div>
          <h2>Action: {this.getAction()}</h2>
          <code>
            <div>Eyes Open: {this.state.face.EyesOpen.Value ? "True" : "False"}</div>
            <div>Mouth Open: {this.state.face.MouthOpen.Value ? "True" : "False"}</div>
            <div>Head Direction: {this.getHeadYawDirection()}<small> ({(this.state.face.Pose.Yaw - this.state.initialPose.Yaw).toFixed(2)})</small></div>
            <div>Head Pitch: {this.getHeadPitchDirection()}<small> ({(this.state.face.Pose.Pitch - this.state.initialPose.Pitch).toFixed(2)})</small></div>
          </code>
        </div>
      );
    }

    return <h1>Calibrate Capture</h1>
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Webcam audio={false} screenshotFormat="image/jpeg" ref={this.setCameraRef}/>
          <button onClick={this.getImage}>Capture</button>
          {this.renderDetails()}
          <button onClick={this.calibrate}>Calibrate</button>
        </header>
      </div>
    );
  }
}

export default App;
