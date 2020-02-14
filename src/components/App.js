import React, { Component } from "react";
import Web3 from "web3";
import logo from "../logo.png";
// import "./App.css";
import MediaPlatform from "../abis/MediaPlatform.json";
import Main from "./Main";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.min.js";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = MediaPlatform.networks[networkId];
    if (networkData) {
      const contract = web3.eth.Contract(
        MediaPlatform.abi,
        networkData.address
      );
      this.setState({ contract });
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
    var mediaCount = await this.state.contract.methods.mediaTotal().call();
    this.setState({ mediaCount });

    for (var i = 1; i <= mediaCount; i++) {
      const media = await this.state.contract.methods.mediaMap(i).call();
      this.setState({
        mediaArray: [...this.state.mediaArray, media]
      });
    }
  }

  tipMediaFile(id, price) {
    this.setState({ loading: true });
    this.state.contract.methods
      .tipMedia(id)
      .send({ from: this.state.account, value: price })
      .once("receipt", receipt => {
        this.setState({ loading: false });
      });
  }

  constructor(props) {
    super(props);

    this.tipMediaFile = this.tipMediaFile.bind(this);
    this.state = {
      mediaHash: "",
      mediaTitle: "",
      mediaCount: 0,
      mediaArray: [],
      loading: false,
      contract: null,
      web3: null,
      buffer: null,
      account: null
    };
  }

  captureFile = event => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  onSubmit = event => {
    event.preventDefault();
    console.log("Submitting file to ipfs...");
    ipfs.add(this.state.buffer, (error, result) => {
      // console.log("Ipfs result", result[0].hash);
      if (error) {
        console.error(error);
        return;
      }
      this.state.contract.methods
        .createMedia(this.state.mediaTitle, result[0].hash)
        .send({ from: this.state.account })
        .then(r => {
          return this.setState({ mediaHash: result[0].hash });
        });
    });
  };

  updateInputValue(evt) {
    console.log(evt.target.value);
    this.setState({
      mediaTitle: evt.target.value
    });
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            MediaSec - Now Upload Files Securely
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="container">
              <div className="content mr-auto ml-auto">
                <a href="" target="_blank" rel="noopener noreferrer"></a>
                <p></p>
                <h1 className="text-center">Upload File</h1>
                <form onSubmit={this.onSubmit}>
                  <div className="form-group">
                    <label htmlFor="mediaTitle">Media Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="mediaTitle"
                      placeholder="Title"
                      onChange={evt => this.updateInputValue(evt)}
                      value={this.state.mediaTitle}
                    />
                    <p></p>
                    <input type="file" onChange={this.captureFile} />
                    <p></p>
                    <input
                      type="submit"
                      className="btn btn-success"
                      value="Upload Now!!"
                    />
                  </div>
                </form>
                <p></p>
                <hr></hr>
                <p></p>
                <h1 className="text-center">Download File</h1>
                <form onSubmit={this.onSubmit}>
                  <div className="form-group">
                    <label htmlFor="mediaHash">Media File Hash</label>
                    <input
                      type="text"
                      className="form-control"
                      id="mediaHash"
                      placeholder="File Hash"
                    />
                    <p></p>
                    <input
                      type="submit"
                      className="btn btn-success"
                      value="Get Media Now"
                    />
                  </div>
                </form>
                <p></p>
                <hr></hr>
                <p></p>
                <Main
                  mediaArray={this.state.mediaArray}
                  tipMedia={this.tipMediaFile}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
