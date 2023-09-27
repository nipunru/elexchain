import React, { Component } from "react";

import "./AddCandidate.css";

export default class AddCandidate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      header: "",
      slogan: "",
      electionParty: "",
      colorCode: "#FF00FF",
      candidates: [],
      candidateCount: undefined,
      elStarted: false,
      elEnded: false,
    };
  }

  componentDidMount = async () => {
    // refreshing page only once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      this.setState({
        web3: this.props.web3,
        ElectionInstance: this.props.ElectionInstance,
        account: this.props.account,
        isAdmin: this.props.isAdmin,
        elStarted: this.props.elStarted,
        elEnded: this.props.elEnded,
      });

      const candidateCount = await this.props.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Loading Candidates details
      for (let i = 0; i < this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i)
          .call();
        this.state.candidates.push({
          id: candidate.candidateId,
          header: candidate.header,
          slogan: candidate.slogan,
          electionParty: candidate.electionParty,
          candidateNumber: candidate.candidateNumber,
          colorCode: candidate.colorCode,
        });
      }

      this.setState({ candidates: this.state.candidates });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  };
  updateHeader = (event) => {
    this.setState({ header: event.target.value });
  };
  updateSlogan = (event) => {
    this.setState({ slogan: event.target.value });
  };

  updateElectionParty = (event) => {
    this.setState({ electionParty: event.target.value });
  };

  updateCandidateNumber = (event) => {
    this.setState({ candidateNumber: event.target.value });
  };

  updateColorCode = (event) => {
    this.setState({ colorCode: event.target.value });
  };

  addCandidate = async () => {
    await this.state.ElectionInstance.methods
      .addCandidate(
        this.state.header,
        this.state.slogan,
        this.state.electionParty,
        this.state.candidateNumber,
        this.state.colorCode
      )
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    return (
      <div className="add-candidate-container">
        <h3>Candidates</h3>
        {!this.state.elStarted && !this.state.elEnded ? (
          <form className="form">
            <div className="form-row">
              <label className={"label-ac"}>
                Candidate Name
                <br />
                <input
                  className={"input-ac"}
                  type="text"
                  placeholder="eg. Marcus"
                  value={this.state.header}
                  onChange={this.updateHeader}
                />
              </label>
              <label className={"label-ac"}>
                Candidate Number
                <br />
                <input
                  className={"input-ac"}
                  type="number"
                  placeholder="eg. Marcus"
                  value={this.state.candidateNumber}
                  onChange={this.updateCandidateNumber}
                />
              </label>
              <label className={"label-ac"}>
                Election Party
                <br />
                <input
                  className={"input-ac"}
                  type="text"
                  placeholder="eg. Rebelians"
                  value={this.state.electionParty}
                  onChange={this.updateElectionParty}
                />
              </label>
              <label className={"label-ac"}>
                Slogan
                <br />
                <input
                  className={"input-ac"}
                  type="text"
                  placeholder="eg. It is what it is"
                  value={this.state.slogan}
                  onChange={this.updateSlogan}
                />
              </label>
              <label className={"label-ac"}>
                Party Color
                <br />
                <input
                  className={"input-ac"}
                  type="color"
                  style={{ height: "40px" }}
                  value={this.state.colorCode}
                  onChange={this.updateColorCode}
                />
                <input
                  className={"input-ac"}
                  type="text"
                  value={this.state.colorCode}
                  onChange={this.updateColorCode}
                />
              </label>
            </div>
            <button
              className="btn-add"
              style={{ marginBottom: "0px", width: "130px" }}
              disabled={
                this.state.header.length < 3 || this.state.header.length > 21
              }
              onClick={this.addCandidate}
            >
              Add
            </button>
          </form>
        ) : null}
        <CandidateList
          candidates={this.state.candidates}
          showTitle={!this.state.elStarted && !this.state.elEnded}
        />
      </div>
    );
  }
}

const CandidateList = ({ candidates, showTitle }) => (
  <div className="candidate-list-container">
    {showTitle ? <h5>Candidates List</h5> : null}
    {candidates.length < 1 ? (
      <div className="no-candidates-alert">No candidates added.</div>
    ) : (
      candidates.map((candidate) => (
        <div
          className="candidate-item"
          key={candidate.id}
          style={{ backgroundColor: `${candidate.colorCode}80` }}
        >
          {" "}
          {/* 80 is added for 50% opacity in Hex */}
          <div className="left-content">
            <strong>{candidate.header}</strong>
            <p className="slogan-text">{candidate.slogan}</p>
          </div>
          <div
            className="right-content"
            style={{ backgroundColor: candidate.colorCode }}
          >
            {candidate.electionParty} | {candidate.candidateNumber}
          </div>
        </div>
      ))
    )}
  </div>
);
