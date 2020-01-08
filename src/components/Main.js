import React, { Component } from "react";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tipCustomAmt: 0
    };
  }

  updateInputValue(evt) {
    console.log(evt.target.value);
    this.setState({
      tipCustomAmt: evt.target.value
    });
  }

  render() {
    return (
      <div id="content">
        {this.props.mediaArray.map((mediaFile, key) => {
          //   console.log("{`https://ipfs.infura.io/ipfs/${mediaFile.memeHash}`}");
          return (
            <div>
              <div className="row mb-4">
                <div className="col-6">
                  <img
                    className="img-fluid"
                    height="300"
                    width="400"
                    src={"https://ipfs.infura.io/ipfs/" + mediaFile.mediaHash}
                    alt=""
                  />
                </div>

                <div className="col-6">
                  <p>
                    <b>{mediaFile.id.toString() + ". " + mediaFile.title}</b>
                  </p>
                  <p>{"File Hash : " + mediaFile.mediaHash}</p>
                  <p>{"Uploaded By : " + mediaFile.owner}</p>
                  <p>
                    {"Tip Amount : " +
                      window.web3.utils.fromWei(
                        mediaFile.tipAmount.toString(),
                        "Ether"
                      ) +
                      " Ether(s)"}
                  </p>

                  <p>
                    <input
                      onChange={evt => this.updateInputValue(evt)}
                      className="mr-3"
                      type="number"
                      placeholder="Amount in Ether"
                    ></input>
                    <button
                      className="btn btn-info"
                      name={mediaFile.id.toString()}
                      onClick={event => {
                        let tipAmount = window.web3.utils.toWei(
                          this.state.tipCustomAmt.toString(),
                          "Ether"
                        );
                        console.log(event.target.name, tipAmount);
                        this.props.tipMedia(event.target.name, tipAmount);
                      }}
                    >
                      TIP ETH
                    </button>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default Main;
