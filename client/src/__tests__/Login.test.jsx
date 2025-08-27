import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Register from "../components/Register";

describe("Register Component", () => {
  const mockRegister = jest.fn();

  const setup = () =>
    render(
      <MemoryRouter>
        <Register onRegister={mockRegister} />
      </MemoryRouter>
    );

  test("renders all form fields", () => {
    setup();

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument(); // exact match
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/admin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/user/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  test("shows error if passwords do not match", async () => {
    setup();

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test("shows error if password is less than 6 characters", async () => {
    setup();

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Password must be at least 6/i)).toBeInTheDocument();
  });

  test("calls onRegister when form is valid", async () => {
    mockRegister.mockResolvedValueOnce({ success: true });

    setup();

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByLabelText(/user/i));

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "password123",
        "user"
      )
    );
  });

  test("displays error from onRegister result", async () => {
    mockRegister.mockResolvedValueOnce({ success: false, message: "User already exists" });

    setup();

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByLabelText(/admin/i));

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/User already exists/i)).toBeInTheDocument();
  });
});
