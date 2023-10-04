import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "./App"; // Assuming the main app component is App.js

describe("ElexChain App", () => {
  it("should allow the commissioner to login", () => {
    const { getByLabelText, getByText } = render(<App />);
    fireEvent.change(getByLabelText(/Email/i), {
      target: { value: "commissioner@example.com" },
    });
    fireEvent.change(getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText(/Login/i));
    expect(getByText(/Commissioner Dashboard/i)).toBeInTheDocument();
  });

  it("should allow commissioner to create an election", () => {
    const { getByText, getByLabelText } = render(<App />);
    fireEvent.click(getByText(/Create Election/i));
    fireEvent.change(getByLabelText(/Election Name/i), {
      target: { value: "General Election 2024" },
    });
    fireEvent.click(getByText(/Submit/i));
    expect(getByText(/Election created successfully/i)).toBeInTheDocument();
  });

  it("should allow commissioner to add candidates", () => {
    const { getByText, getByLabelText } = render(<App />);
    fireEvent.click(getByText(/Add Candidate/i));
    fireEvent.change(getByLabelText(/Candidate Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.click(getByText(/Add/i));
    expect(getByText(/Candidate added successfully/i)).toBeInTheDocument();
  });

  // Simulate an error case for adding candidates
  it("should show an error for adding candidates if backend fails", () => {
    const { getByText } = render(<App />);
    fireEvent.click(getByText(/Add Candidates/i));
    expect(getByText(/Database write error/i)).toBeInTheDocument();
  });

  it("should allow commissioner to start the election", () => {
    const { getByText } = render(<App />);
    fireEvent.click(getByText(/Start Election/i));
    expect(getByText(/Election started successfully/i)).toBeInTheDocument();
  });

  it("should allow commissioner to end the election", () => {
    const { getByText } = render(<App />);
    fireEvent.click(getByText(/End Election/i));
    expect(getByText(/Election ended successfully/i)).toBeInTheDocument();
  });

  it("should allow admin to enable voting", () => {
    const { getByText } = render(<App />);
    fireEvent.click(getByText(/Enable Voting/i));
    expect(getByText(/Voting enabled successfully/i)).toBeInTheDocument();
  });

  it("should allow voter to enter PIN and view candidates", () => {
    const { getByText, getByLabelText } = render(<App />);
    fireEvent.change(getByLabelText(/Enter PIN/i), {
      target: { value: "123456" },
    });
    fireEvent.click(getByText(/Submit/i));
    expect(getByText(/Candidate List/i)).toBeInTheDocument();
  });

  it("should allow voter to cast a vote and show confirmation", () => {
    const { getByText } = render(<App />);
    fireEvent.click(getByText(/Vote for John Doe/i));
    expect(getByText(/Vote cast successfully/i)).toBeInTheDocument();
  });
});
