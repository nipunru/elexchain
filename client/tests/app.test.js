import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "../src/App";

describe("ElexChain App", () => {
  const setup = () => {
    const utils = render(<App />);
    const getByEmail = utils.getByLabelText(/Email/i);
    const getByPassword = utils.getByLabelText(/Password/i);
    const getByLogin = utils.getByText(/Login/i);
    return {
      ...utils,
      getByEmail,
      getByPassword,
      getByLogin,
    };
  };

  it("handles commissioner login", () => {
    const { getByEmail, getByPassword, getByLogin, getByText } = setup();

    fireEvent.change(getByEmail, {
      target: { value: "commissioner@example.com" },
    });
    fireEvent.change(getByPassword, { target: { value: "password123" } });
    fireEvent.click(getByLogin);

    expect(getByText(/Commissioner Dashboard/i)).toBeInTheDocument();
  });

  it("allows commissioner to create an election", () => {
    const { getByText, getByLabelText } = setup();

    fireEvent.click(getByText(/Create Election/i));
    fireEvent.change(getByLabelText(/Election Name/i), {
      target: { value: "General Election 2024" },
    });
    fireEvent.click(getByText(/Submit/i));

    expect(getByText(/Election created successfully/i)).toBeInTheDocument();
  });

  it("allows commissioner to add candidates", () => {
    const { getByText, getByLabelText } = setup();

    fireEvent.click(getByText(/Add Candidate/i));
    fireEvent.change(getByLabelText(/Candidate Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.click(getByText(/Add/i));

    expect(getByText(/Candidate added successfully/i)).toBeInTheDocument();
  });

  it("shows an error when adding candidates if backend fails", () => {
    const { getByText } = setup();

    fireEvent.click(getByText(/Add Candidates/i));
    expect(getByText(/Database write error/i)).toBeInTheDocument();
  });

  it("allows commissioner to start and end the election", () => {
    const { getByText } = setup();

    fireEvent.click(getByText(/Start Election/i));
    expect(getByText(/Election started successfully/i)).toBeInTheDocument();

    fireEvent.click(getByText(/End Election/i));
    expect(getByText(/Election ended successfully/i)).toBeInTheDocument();
  });

  it("allows admin to enable voting", () => {
    const { getByText } = setup();

    fireEvent.click(getByText(/Enable Voting/i));
    expect(getByText(/Voting enabled successfully/i)).toBeInTheDocument();
  });

  it("handles voter PIN entry and candidate view", () => {
    const { getByText, getByLabelText } = setup();

    fireEvent.change(getByLabelText(/Enter PIN/i), {
      target: { value: "123456" },
    });
    fireEvent.click(getByText(/Submit/i));

    expect(getByText(/Candidate List/i)).toBeInTheDocument();
  });

  it("confirms successful vote casting", () => {
    const { getByText } = setup();

    fireEvent.click(getByText(/Vote for John Doe/i));
    expect(getByText(/Vote cast successfully/i)).toBeInTheDocument();
  });
});
