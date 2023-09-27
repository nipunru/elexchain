// Node modules
import React, { Component } from "react";
import { useForm } from "react-hook-form";
import { Link, withRouter } from "react-router-dom";

// Components
import Navbar from "./Navbar/Navigation";
import NavbarAdmin from "./Navbar/NavigationAdmin";

// Contract
import getWeb3 from "../getWeb3";
import Election from "../contracts/Election.json";

// CSS
import "./Home.css";
import AddCandidate from "./Admin/AddCandidate/AddCandidate";

// const buttonRef = React.createRef();
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
      elDetails: {},
      showModal: false,
      electionInit: false,
    };
  }

  // refreshing once
  componentDidMount = async () => {
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }
    try {
      let level = localStorage.getItem("level");
      if (level == 1) {
        this.setState({ isAdmin: true });
      } else {
        this.props.history.push("/Voting"); // <-- redirect here
      }

      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({
        web3: web3,
        ElectionInstance: instance,
      });

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      this.setState({
        account: admin,
      });

      // Get election start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call();
      this.setState({ elStarted: start });
      const end = await this.state.ElectionInstance.methods.getEnd().call();
      this.setState({ elEnded: end });

      await this.getElectionDetails();
      await this.getCandidateCount();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // start election
  startElection = async () => {
    await this.state.ElectionInstance.methods
      .startElection()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  // end election
  endElection = async () => {
    await this.state.ElectionInstance.methods
      .endElection()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  // register and start election
  registerElection = async (data) => {
    const regReciept = await this.state.ElectionInstance.methods
      .setElectionDetails(data.electionTitle, data.electionYear)
      .send({ from: this.state.account, gas: 1000000 });

    if (regReciept.status) {
      this.setState({
        elDetails: {
          electionTitle: data.electionTitle,
          electionYear: data.electionYear,
        },
        showModal: false,
        electionInit: true,
      });
      this.getCandidateCount();
    }
  };

  toggleModal = () => {
    this.setState((prevState) => ({
      showModal: !prevState.showModal,
    }));
  };

  async getCandidateCount() {
    const candidateCount = await this.state.ElectionInstance.methods
      .getTotalCandidate()
      .call();
    this.setState({ candidateCount: candidateCount });
  }

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

  render() {
    if (!this.state.web3) {
      return (
        <>
          <div class="loading-container">
            <div class="loading-content">
              <div class="loader"></div>
              <p>ElexChain is loading...</p>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <div className="container-main">
          <div className="container-item info">
            {this.state.electionInit == false ? (
              <div className="content-wrap">
                <div className="text-section">
                  <h3>The election has not been initialized.</h3>
                  {this.state.isAdmin ? (
                    <p>Please create the election and follow next steps</p>
                  ) : (
                    <p>Please wait...</p>
                  )}
                </div>
                <div className="button-section">
                  {this.state.isAdmin ? (
                    <button onClick={this.toggleModal}>Create Election</button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="content-wrap">
                <div className="text-section">
                  <h3>
                    {this.state.elDetails.electionTitle} [
                    {this.state.elDetails.electionYear}]
                  </h3>
                  {this.state.candidateCount == 0 ? (
                    <p>Please add candidates to the election</p>
                  ) : !this.state.elStarted && !this.state.elEnded ? (
                    <p>Election is ready to start</p>
                  ) : this.state.elEnded ? (
                    <p>Election is ended</p>
                  ) : (
                    <p>Election is in-progress</p>
                  )}
                </div>
                <div className="button-section">
                  {this.state.candidateCount < 2 ? null : !this.state
                      .elStarted && !this.state.elEnded ? (
                    <button onClick={this.startElection}>Start Election</button>
                  ) : this.state.elEnded ? (
                    <button>
                      <Link to="/Results">See results</Link>
                    </button>
                  ) : (
                    <button onClick={this.endElection}>End Election</button>
                  )}
                </div>
              </div>
            )}
          </div>
          {this.state.electionInit ? (
            <AddCandidate
              web3={this.state.web3}
              ElectionInstance={this.state.ElectionInstance}
              account={this.state.account}
              isAdmin={this.state.isAdmin}
              elStarted={this.state.elStarted}
              elEnded={this.state.elEnded}
            />
          ) : null}
        </div>
        {this.state.isAdmin ? (
          <>
            <this.renderAdminHome />
          </>
        ) : null}
      </>
    );
  }

  renderAdminHome = () => {
    const EMsg = (props) => {
      return <span style={{ color: "tomato" }}>{props.msg}</span>;
    };

    const CreateElectionModal = () => {
      const {
        handleSubmit,
        register,
        formState: { errors },
      } = useForm();

      const onSubmit = (data) => {
        this.registerElection(data);
      };

      return (
        <div className="modal-background">
          <div className="modal-content">
            <button className="close-button" onClick={this.toggleModal}>
              &times;
            </button>

            <h3>Create Election</h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="label-home">
                Election Title{" "}
                {errors.electionTitle && <EMsg msg="*required" />}
                <input
                  className="input-home"
                  type="text"
                  placeholder="eg. Presidential Election"
                  {...register("electionTitle", {
                    required: true,
                  })}
                />
              </label>
              <label className="label-home">
                Election Year {errors.electionYear && <EMsg msg="*required" />}
                <input
                  className="input-home"
                  type="number"
                  placeholder="eg. 2023"
                  {...register("electionYear", {
                    required: true,
                  })}
                />
              </label>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      );
    };

    const AdminHome = () => {
      return <div>{this.state.showModal && <CreateElectionModal />}</div>;
    };

    return <AdminHome />;
  };
}

export default withRouter(Home);
