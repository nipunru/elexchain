import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { withAlert } from "react-alert";
import Modal from "react-modal";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";
import Voting from "./Voting";

jest.mock("../../../getWeb3");
jest.mock("react-modal");
jest.mock("react-alert", () => ({
  withAlert: jest.fn().mockImplementation((Component) => Component),
}));

describe("Voting", () => {
  const mockWeb3 = {
    eth: {
      getAccounts: jest.fn(),
      net: {
        getId: jest.fn(),
      },
      Contract: jest.fn(),
      accounts: {
        create: jest.fn(),
      },
    },
  };

  const mockElectionInstance = {
    methods: {
      getAdmin: jest.fn(),
      getTotalCandidate: jest.fn(),
      getStart: jest.fn(),
      getEnd: jest.fn(),
      candidateDetails: jest.fn(),
      getElectionDetails: jest.fn(),
      registerAsVoter: jest.fn(),
      transferEther: jest.fn(),
      vote: jest.fn().mockReturnValue({
        encodeABI: jest.fn(),
      }),
    },
    networks: {
      5777: {
        address: "mock_address",
      },
    },
  };

  beforeEach(() => {
    getWeb3.mockImplementation(() => Promise.resolve(mockWeb3));
    mockWeb3.eth.Contract.mockImplementation(() => mockElectionInstance);
    Modal.setAppElement.mockImplementation(() => null); // Setup for react-modal
  });

  it("should render without web3 and display loading message", () => {
    const { getByText } = render(<Voting alert={{ error: jest.fn() }} />);
    expect(getByText("ElexChain is loading...")).toBeInTheDocument();
  });

  it("should render VoteNotStarted when election has not started and not ended", async () => {
    mockElectionInstance.methods.getStart.mockImplementation(() =>
      Promise.resolve(false)
    );
    mockElectionInstance.methods.getEnd.mockImplementation(() =>
      Promise.resolve(false)
    );

    await act(async () => {
      render(<Voting alert={{ error: jest.fn() }} />);
    });

    expect(
      screen.getByText("The election has not been initialized.")
    ).toBeInTheDocument();
  });

  it("calls confirmVote with the right parameters when vote button is clicked", async () => {
    const mockConfirmVote = jest.fn();
    Voting.prototype.confirmVote = mockConfirmVote; // Replace with how you actually call confirmVote

    const { getByText } = render(
      <Voting candidateCount={3} candidates={mockCandidates} />
    );

    fireEvent.click(getByText("Vote for Candidate 1"));
    expect(mockConfirmVote).toHaveBeenCalledWith("candidate_1_id"); // Adjust depending on how you identify candidates
  });
});
