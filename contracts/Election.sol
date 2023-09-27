// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract Election {
    address public commissioner;
    uint256 candidateCount;
    uint256 voterCount;
    bool start;
    bool end;
    address public currentUser;
    mapping (string => bool) isRegistered;
    mapping (string => bool) voterPIN;
    
    constructor() public {
        commissioner = 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1;
        candidateCount = 0;
        voterCount = 0;
        start = false;
        end = false;
        setPINs();
    }

    function isAdmin(address _address) public view returns (bool) {
        return commissioner == _address;
    }

    function getAdmin() public view returns (address) {
        // Returns account address used to deploy contract (i.e. admin)
        return commissioner;
    }

    modifier onlyAdmin() {
        // Modifier for only admin access
        require(isAdmin(msg.sender));
        _;
    }

    function getCurrentUser() public view returns (address) {
        // Returns account address used to deploy contract (i.e. admin)
        return currentUser;
    }

    function transferEther(address payable recipient) public payable {
        require(msg.value > 0, "You must send some Ether");
        
        // Ensure the sender has enough balance (although this is redundant since Ethereum will check this inherently).
        require(address(msg.sender).balance >= msg.value, "Insufficient balance");

        // Transfer the amount to the recipient.
        recipient.transfer(msg.value);
    }

    // Modeling a candidate
    struct Candidate {
        uint256 candidateId;
        string header;
        string slogan;
        string electionParty;
        uint256 voteCount;
        string candidateNumber;
        string colorCode;
    }
    mapping(uint256 => Candidate) public candidateDetails;

    // Adding new candidates
    function addCandidate(
        string memory _header, 
        string memory _slogan, 
        string memory _electionParty,
        string memory _candidateNumber,
        string memory _colorCode
        )
        public
        // Only admin can add
        onlyAdmin
    {
        require(!isRegistered[_candidateNumber], 'This Number is already registered');

        Candidate memory newCandidate =
            Candidate({
                candidateId: candidateCount,
                header: _header,
                slogan: _slogan,
                electionParty: _electionParty,
                voteCount: 0,
                candidateNumber: _candidateNumber,
                colorCode: _colorCode
            });
        candidateDetails[candidateCount] = newCandidate;
        candidateCount += 1;

        isRegistered[_candidateNumber] = true;
    }

    // Modeling a Election Details
    struct ElectionDetails {
        string electionTitle;
        string electionYear;
    }
    ElectionDetails electionDetails;

    function setElectionDetails(
        string memory _electionTitle,
        string memory _electionYear
    )
        public
        // Only admin can add
        onlyAdmin
    {
        electionDetails = ElectionDetails(
            _electionTitle,
            _electionYear
        );
        start = false;
        end = false;
    }

    // Get Elections details
    function getElectionDetails()
    public
    view
    returns(string memory electionTitle, 
    string memory electionYear){
        return(electionDetails.electionTitle, 
        electionDetails.electionYear);
    }

    // Get candidates count
    function getTotalCandidate() public view returns (uint256) {
        // Returns total number of candidates
        return candidateCount;
    }

    // Get voters count
    function getTotalVoter() public view returns (uint256) {
        // Returns total number of voters
        return voterCount;
    }

    // Modeling a voter
    struct Voter {
        address voterAddress;
        bool isVerified;
        bool hasVoted;
        bool isRegistered;
    }
    address[] public voters; // Array of address to store address of voters
    mapping(address => Voter) public voterDetails;

    // Request to be added as voter
    function registerAsVoter(address _address) public onlyAdmin {
        Voter memory newVoter =
            Voter({
                voterAddress: _address,
                hasVoted: false,
                isVerified: true,
                isRegistered: true
            });
        voterDetails[_address] = newVoter;
        voters.push(_address);
        currentUser = _address;
        voterCount += 1;
    }

    // Verify voter
    function verifyVoter(bool _verifedStatus, address voterAddress)
        public
        // Only admin can verify
        onlyAdmin
    {
        voterDetails[voterAddress].isVerified = _verifedStatus;
    }

    // Vote
    function vote(uint256 candidateId) public returns (bool) {
        require(voterDetails[msg.sender].hasVoted == false, 'Already voted');
        require(voterDetails[msg.sender].isVerified == true, 'Not registered');
        require(start == true);
        require(end == false);
        candidateDetails[candidateId].voteCount += 1;
        voterDetails[msg.sender].hasVoted = true;
        return true;
    }

    // End election
    function endElection() public onlyAdmin {
        end = true;
        start = false;
    }

      // End election
    function startElection() public onlyAdmin {
        end = false;
        start = true;
    }

    // Get election start and end values
    function getStart() public view returns (bool) {
        return start;
    }

    function getEnd() public view returns (bool) {
        return end;
    }

    function validatePIN(string memory _pin) public returns (bool) {
        require(voterPIN[_pin], 'Invalid PIN');
        
        if (start) {
            voterPIN[_pin] = false;
        }
        return true;
    }

    function setPINs() private {
        voterPIN["11323121"] = true;
        voterPIN["12345678"] = true;
        voterPIN["87654321"] = true;
        voterPIN["11223344"] = true;
        voterPIN["55667788"] = true;
        voterPIN["78901234"] = true;
        voterPIN["56789012"] = true;
        voterPIN["90123456"] = true;
        voterPIN["23456789"] = true;
        voterPIN["34567890"] = true;
        voterPIN["45678901"] = true;
    }
}
