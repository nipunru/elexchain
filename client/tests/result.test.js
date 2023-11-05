import React from "react";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import Result from "./Result"; // Assuming this is the file path
import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

// Mock getWeb3 and Election contract
jest.mock("../../../getWeb3");
jest.mock("../../../contracts/Election.json", () => ({
  networks: { 5777: { address: "mockedAddress" } },
  abi: [],
}));

// Mocks for other components and functions that Result uses, like Navbar components.
jest.mock("../../Navbar/Navigation", () => () => <div>Navigation</div>);
jest.mock("../../Navbar/NavigationAdmin", () => () => (
  <div>NavigationAdmin</div>
));
jest.mock("../../NotInit", () => () => <div>NotInit</div>);

// Utility function to mock a contract method call response
const mockContractMethodCall = (methodName, returnValue) => {
  return {
    methods: {
      [methodName]: () => ({
        call: jest.fn().mockResolvedValue(returnValue),
      }),
    },
  };
};

beforeEach(() => {
  // Reset the mocks before each test
  getWeb3.mockImplementation(() =>
    Promise.resolve({
      eth: {
        getAccounts: () => Promise.resolve(["mockedAccount"]),
        Contract: jest
          .fn()
          .mockImplementation(() =>
            mockContractMethodCall("getTotalCandidate", "2")
          ),
        net: {
          getId: () => Promise.resolve("5777"), // Your test network id
        },
      },
    })
  );
});

test("renders loading state", () => {
  render(<Result />);
  expect(screen.getByText(/ElexChain is loading.../i)).toBeInTheDocument();
});

test("renders navbar based on admin status", async () => {
  render(<Result />);
  await waitFor(() => {
    expect(screen.getByText("NavigationAdmin")).toBeInTheDocument();
  });
});

test("renders not initialized state", async () => {
  const web3Instance = {
    eth: {
      Contract: jest
        .fn()
        .mockImplementation(() => mockContractMethodCall("getStart", false)),
    },
  };
  getWeb3.mockImplementation(() => Promise.resolve(web3Instance));

  render(<Result />);
  await waitFor(() => {
    expect(screen.getByText("NotInit")).toBeInTheDocument();
  });
});

test("renders results after election ended", async () => {
  const web3Instance = {
    eth: {
      Contract: jest.fn().mockImplementation(() => {
        return {
          ...mockContractMethodCall("getStart", false),
          ...mockContractMethodCall("getEnd", true),
          ...mockContractMethodCall("getAdmin", "mockedAdminAccount"),
          ...mockContractMethodCall("candidateDetails", {
            candidateId: "1",
            header: "Candidate 1",
            slogan: "Vote for me",
            voteCount: "100",
            electionParty: "Party A",
            candidateNumber: "1",
            colorCode: "#FF00FF",
          }),
        };
      }),
    },
  };
  getWeb3.mockImplementation(() => Promise.resolve(web3Instance));

  render(<Result />);
  await waitFor(() => {
    expect(screen.getByText("Winner!")).toBeInTheDocument();
    expect(screen.getByText("Candidate 1")).toBeInTheDocument();
    expect(screen.getByText("100 Votes")).toBeInTheDocument();
  });
});
