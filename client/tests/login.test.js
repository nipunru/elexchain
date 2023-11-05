// Login.test.js
import React from "react";
import { MemoryRouter } from "react-router-dom"; // MemoryRouter is used for testing
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../src/component/Login/Login";

const setup = () => {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

describe("Login component", () => {
  it("renders the login form with two input fields and a button", () => {
    setup();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("allows a user to type an email and password", () => {
    setup();
    userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    userEvent.type(screen.getByLabelText(/password/i), "password123");
    expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
    expect(screen.getByLabelText(/password/i)).toHaveValue("password123");
  });

  it("submits the form and calls the login API", async () => {
    setup();
    const email = "test@example.com";
    const password = "password123";

    axios.post.mockResolvedValueOnce({
      data: {
        token: "fake_token",
      },
    });

    userEvent.type(screen.getByLabelText(/email/i), email);
    userEvent.type(screen.getByLabelText(/password/i), password);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith("/login", {
        email: email,
        password: password,
      });
    });
  });

  it("handles login failure", async () => {
    setup();
    const errorMessage = "Invalid credentials";

    axios.post.mockRejectedValueOnce(new Error(errorMessage));

    userEvent.type(screen.getByLabelText(/email/i), "wrong@example.com");
    userEvent.type(screen.getByLabelText(/password/i), "wrong");
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(errorMessage);
    });
  });
});
