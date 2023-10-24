# ElexChain

## Blockchain-Based Voting Systems: Enhancing Security and Transparency in Digital Voting Systems

## Description

This project provides an innovative solution for conducting transparent and secure elections leveraging blockchain technology. It's an Ethereum-based voting system that ensures the integrity and reliability of the voting process.

Voters are provided a unique PIN at the voting point after manual verification by an officer. Upon entering the PIN in the kiosk, voters are presented with a list of candidates. Post selection, the system acknowledges the vote with a success message and resets for the next voter.

Key features include:

- **Commissioner Access**: Allows creating elections, adding candidates, starting & ending elections, and viewing results.
- **Admin Access**: Grants rights to enable the voting process.
- **Secure PIN-Based Voting**: Ensures that only authorized voters can cast their vote.

## Tech Stack

- **Blockchain**: Ethereum network, with smart contracts developed using Solidity.
- **Frontend**: React.js for a dynamic and responsive user interface.
- **Backend**: Node.js with Express.js framework.
- **Database**: MongoDB, primarily for user authentication and login functionalities.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js
- npm
- Ganache CLI
- Truffle

## Setup & Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/nipunru/elexchain.git
   ```

2. Navigate to the project directory:

   ```bash
   cd elexchain
   ```

3. Install the necessary dependencies:
   ```bash
   npm install
   ```

## Running the Application

Follow the steps below to run the application:

### 1. Start the server

```bash
cd server
npm run start-watch
```

### 2. Start Ganache CLI

In a new terminal:

```bash
ganache-cli -chainId 1337
```

### 3. Compile and Migrate the Contracts

In another terminal:

```bash
truffle compile
truffle migrate --reset
```

### 4. Start the Client

In yet another terminal:

```bash
cd client
npm start
```

The application should now be running on `http://localhost:3000` or a similar available port.

## Contribution

Nipun Ruwanpathirana
