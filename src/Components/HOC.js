import React, { Component } from "react";
import Election from "../../build/contracts/Election.json";

const HOC = OtherComponent => {
  return class Vote extends Component {
    constructor(props) {
      super(props);
      this.state = {
        electionInstance: {},
        candidates: [],
        account: "",
        votedStatus: null,
        cast: false,
        elections: [
          {
            name: " Election of 1800"
          }
        ]
      };
      this.castVote = this.castVote.bind(this);
    }

    async componentDidMount() {
      try {
        // Obtain the Web3 object and instantiate the smart contract.
        await this.instantiateContract();
        // Obtain the candidate count after.
        await this.getCandidateCount();
        // Obtain the result of the account being in the voters mapping.
        await this.getVoterState();
      } catch (err) {
        console.error(err);
      }
    }

    async instantiateContract() {
      try {
        const contract = require("truffle-contract");
        const electionContract = contract(Election);
        // IMPORTANT:
        // Set provider of contract's instance to the blockchain node currently connected to
        electionContract.setProvider(window.web3.currentProvider);
        // Await deployed instance of smart contract
        const electionInstance = await electionContract.deployed();
        // Set the instance of contract to local state
        this.setState({ electionInstance });
      } catch (err) {
        console.error(err);
      }
    }

    async getCandidateCount() {
      try {
        const totalNumberOfCandidates = await this.state.electionInstance.candidatesCount();
        const pendingCandidatesArr = [];
        for (let i = 1; i <= totalNumberOfCandidates; i++) {
          pendingCandidatesArr.push(this.state.electionInstance.candidates(i));
        }
        const candidates = await Promise.all(pendingCandidatesArr);
        this.setState({ candidates });
      } catch (err) {
        console.error(err);
      }
    }

    async getVoterState() {
      try {
        const { voters } = this.state.electionInstance;
        await window.web3.eth.getAccounts(async (err, [account]) => {
          let votedStatus = await voters(account);
          this.setState({ votedStatus, account });
          if (votedStatus) {
            this.setState({ cast: true });
          }
        });
      } catch (err) {
        console.error(err);
      }
    }

    async castVote(idx) {
      try {
        const { vote } = this.state.electionInstance;
        await window.web3.eth.getAccounts((err, [account]) => {
          vote(idx, { from: account });
        });
        this.setState({ cast: true });
      } catch (err) {
        console.error(err);
      }
    }

    render() {
      return (
        <OtherComponent
          {...this.props}
          {...this.state}
          castVote={this.castVote}
        />
      );
    }
  };
};

export default HOC;