import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddCandidate from "../AddCandidate";

const mockWeb3 = {};
const mockElectionInstance = {
  methods: {
    getTotalCandidate: jest.fn(),
    candidateDetails: jest.fn(),
    addCandidate: jest.fn(),
  },
};
const mockAccount = "0xMockAccount";
const mockIsAdmin = true;
const mockElStarted = false;
const mockElEnded = false;

jest.mock("../ElectionContract", () => ({
  // Mock the contract methods and their return values here
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockElectionInstance.methods.getTotalCandidate.mockResolvedValue(1);
  mockElectionInstance.methods.candidateDetails.mockResolvedValue({
    candidateId: "1",
    header: "Test Candidate",
    slogan: "Test Slogan",
    electionParty: "Test Party",
    candidateNumber: "1",
    colorCode: "#FFFFFF",
  });
  mockElectionInstance.methods.addCandidate.mockResolvedValue({});
});

// Test cases
describe("AddCandidate component", () => {
  it("loads candidates on component mount", async () => {
    render(
      <AddCandidate
        web3={mockWeb3}
        ElectionInstance={mockElectionInstance}
        account={mockAccount}
        isAdmin={mockIsAdmin}
        elStarted={mockElStarted}
        elEnded={mockElEnded}
      />
    );
  });

  it("submits new candidate data", async () => {
    const { getByPlaceholderText, getByText } = render(
      <AddCandidate
        web3={mockWeb3}
        ElectionInstance={mockElectionInstance}
        account={mockAccount}
        isAdmin={mockIsAdmin}
        elStarted={mockElStarted}
        elEnded={mockElEnded}
      />
    );

    const headerInput = getByPlaceholderText("eg. Marcus");
    fireEvent.change(headerInput, { target: { value: "New Header" } });

    const addButton = getByText("Add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockElectionInstance.methods.addCandidate).toHaveBeenCalledWith(
        "New Header"
      );
    });
  });
});
