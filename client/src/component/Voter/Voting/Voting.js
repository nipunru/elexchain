// Node modules
import React, { Component } from "react";
import { withAlert } from "react-alert";
import Modal from "react-modal";

// Components
import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";
import NotInit from "../../NotInit";

// Contract
import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

// CSS
import "./Voting.css";
import VoteLock from "../VoteLock/VoteLock";
import VoteSuccess from "../VoteSuccess/VoteSuccess";
import VoteEnded from "../VoteEnded/VoteEnded";
import VoteNotStarted from "../VoteNotStarted/VoteNotStarted";

class Voting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      admin: null,
      voaterPK: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      isElStarted: false,
      isElEnded: false,
      contractAddress: null,
      isVoteLock: true,
      elDetails: {
        electionTitle: null,
        electionYear: null,
      },
      confirmModalIsOpen: false,
      currentCandidate: null,
      isVoteSuccess: false,
      electionInit: false,
    };
  }

  componentDidMount = async () => {
    // refreshing once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      let level = localStorage.getItem("level");
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
        contractAddress: deployedNetwork.address,
      });

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      this.setState({
        admin: admin,
      });

      if (this.state.account === admin && level == 1) {
        this.setState({ isAdmin: true });
      }

      // Get total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: candidateCount });

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Loading Candidates details
      for (let i = 1; i <= this.state.candidateCount; i++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(i - 1)
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

      //Load Current Voater
      await this.getElectionDetails();
      await this.reloadVoater();
    } catch (error) {
      this.props.alert.error("Something went wrong! Please contact Admin");
      console.error(error);
    }
  };

  reloadVoater = async () => {
    const newAccount = await this.state.web3.eth.accounts.create();
    console.log(newAccount);
    const accountAdd = newAccount.address;
    this.setState({
      account: accountAdd,
      voaterPK: newAccount.privateKey,
    });

    const transReceipt = await this.state.ElectionInstance.methods
      .transferEther(this.state.account)
      .send({
        from: this.state.admin,
        gas: 100000,
        value: this.state.web3.utils.toWei("0.03", "ether"),
      });

    if (!transReceipt.status) {
      this.props.alert.error("Something went wrong! Please contact Admin");
      console.error("Transation failed transferEther");
      return;
    }

    const regReceipt = await this.state.ElectionInstance.methods
      .registerAsVoter(this.state.account)
      .send({ from: this.state.admin, gas: 600000 });

    if (!regReceipt.status) {
      this.props.alert.error("Something went wrong! Please contact Admin");
      console.error("Transation failed registerAsVoter");
      return;
    }
    this.setState({ isVoteLock: true });
    this.setState({ isVoteSuccess: false });
  };

  async getElectionDetails() {
    const electionDetails = await this.state.ElectionInstance.methods
      .getElectionDetails()
      .call();

    this.setState({
      elDetails: {
        electionTitle: electionDetails.electionTitle,
        electionYear: electionDetails.electionYear,
      },
      electionInit: electionDetails.electionTitle != "",
    });
  }

  renderCandidates = (candidate) => {
    const confirmVote = (id, number, header) => {
      this.openConfirmModal(id, number, header);
    };
    return (
      <div
        className="container-item"
        style={{
          background: `linear-gradient(to right, rgba(255, 255, 255, 0.5), ${candidate.colorCode})`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        <div
          className="candidate-info"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <h2>{candidate.header}</h2>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: candidate.colorCode,
                padding: "5px",
                borderRadius: "5px",
                marginRight: "10px",
              }}
            >
              {candidate.electionParty}
            </div>
            {candidate.slogan}
          </div>
        </div>
        <div className="vote-btn-container">
          <button
            onClick={() =>
              confirmVote(
                candidate.id,
                candidate.candidateNumber,
                candidate.header,
                candidate.party
              )
            }
            className="vote-btn"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 20px", // Added some padding for visual spacing
            }}
          >
            <span style={{ fontSize: "60px" }}>
              {candidate.candidateNumber} |
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "10px",
              }}
            >
              <span>ඡන්දය දෙන්න</span>
              <span>வாக்களியுங்கள்</span>
              <span>Vote</span>
            </div>
          </button>
        </div>
      </div>
    );
  };

  castVote = async (id) => {
    const txData = {
      to: this.state.contractAddress,
      gas: 1000000,
      data: this.state.ElectionInstance.methods.vote(id).encodeABI(),
    };

    const signedTx = await this.state.web3.eth.accounts.signTransaction(
      txData,
      this.state.voaterPK
    );

    const voteReciept = await this.state.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    if (!voteReciept.status) {
      this.props.alert.error("Something went wrong! Please contact Admin");
      console.error("Transation failed registerAsVoter");
    } else {
      this.setState({ isVoteSuccess: true });
      setTimeout(() => {
        this.reloadVoater();
        this.setState({ isVoteSuccess: false });
        this.setState({ isVoteLock: true });
      }, 3000);
    }
  };

  unlockVote = () => {
    this.setState({ isVoteLock: false });
  };

  openConfirmModal = (id, number, header, party) => {
    this.setState({
      confirmModalIsOpen: true,
      currentCandidate: { id, number, header, party },
    });
  };

  closeConfirmModal = () => {
    this.setState({ confirmModalIsOpen: false, currentCandidate: null });
  };

  handleConfirmation = () => {
    if (this.state.currentCandidate) {
      this.castVote(this.state.currentCandidate.id);
    }
    this.closeConfirmModal();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          <div className="loading-container">
            <div className="loading-content">
              <div className="loader"></div>
              <p>ElexChain is loading...</p>
            </div>
          </div>
        </>
      );
    }

    if (!this.state.isElStarted && !this.state.isElEnded) {
      return (
        <>
          <VoteNotStarted />
        </>
      );
    }

    if (!this.state.isElStarted && this.state.isElEnded) {
      return (
        <>
          <VoteEnded />
        </>
      );
    }

    if (this.state.isVoteLock) {
      return (
        <>
          <VoteLock
            web3={this.state.web3}
            ElectionInstance={this.state.ElectionInstance}
            admin={this.state.admin}
            isAdmin={this.state.isAdmin}
            unlockVote={this.unlockVote}
          />
        </>
      );
    }

    if (this.state.isVoteSuccess) {
      return (
        <>
          <VoteSuccess />
        </>
      );
    }

    return (
      <>
        {this.state.isAdmin ? (
          <NavbarAdmin />
        ) : (
          <Navbar
            title={
              this.state.elDetails.electionTitle != null
                ? this.state.elDetails.electionTitle +
                  " [" +
                  this.state.elDetails.electionYear +
                  "]"
                : null
            }
          />
        )}
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <>
              <div className="container-main">
                <h2>ඔබගේ මනාපය පහත අපේක්ෂකයෙක් හට ලබා දෙන්න </h2>
                <h4>கீழே ஒரு வேட்பாளருக்கு உங்கள் விருப்பத்தை வழங்கவும்</h4>
                <h4>Give your vote to a candidate below</h4>
                <br />
                <small>Total candidates: {this.state.candidates.length}</small>
                {this.state.candidates.length < 1 ? (
                  <div className="container-item attention">
                    <center>Not one to vote for.</center>
                  </div>
                ) : (
                  <>{this.state.candidates.map(this.renderCandidates)}</>
                )}
              </div>
            </>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            <>
              <div className="container-item attention">
                <center>
                  <h3>The Election ended.</h3>
                </center>
              </div>
            </>
          ) : null}
        </div>
        <Modal
          isOpen={this.state.confirmModalIsOpen}
          onRequestClose={this.closeConfirmModal}
          className="modal-content"
          overlayClassName="modal-overlay"
        >
          <h2>තහවුරු කරන්න / உறுதிப்படுத்தவும் / Confirm</h2>
          <p>
            ඔබගේ මනාපය අංක {this.state.currentCandidate?.number} යටතේ{" "}
            {this.state.currentCandidate?.party} පක්ෂය නියෝජනය කරන{" "}
            {this.state.currentCandidate?.header} වෙත ලබා දෙන බව තහවිරු කරන්න
          </p>

          <p>
            உங்கள் வாக்கு எண் {this.state.currentCandidate?.number}{" "}
            {this.state.currentCandidate?.party} இன் கீழ் கட்சியை
            பிரதிநிதித்துவப்படுத்தும் {this.state.currentCandidate?.header}{" "}
            வழங்கப்படுவதைத் தடைசெய்க.
          </p>

          <p>
            Confirm that your preference is given to{" "}
            {this.state.currentCandidate?.header} representing the{" "}
            {this.state.currentCandidate?.party}
            party under number {this.state.currentCandidate?.number}
          </p>
          <div className="button-container">
            <button onClick={this.handleConfirmation}>ඔව්/ஆம்/Yes</button>
            <button onClick={this.closeConfirmModal} className="secondary">
              නැත/இல்லை/No
            </button>
          </div>
        </Modal>
      </>
    );
  }
}

export default withAlert()(Voting);
