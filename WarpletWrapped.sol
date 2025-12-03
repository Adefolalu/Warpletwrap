// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title WarpletWrapped
 * @dev NFT contract for minting Warplet Wrapped trading cards
 */
contract WarpletWrapped is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    uint256 public mintPriceETH;
    
    // Individual ERC20 token prices
    mapping(address => uint256) public erc20MintPrices;
    
    // Track which tokens are accepted
    mapping(address => bool) public acceptedTokens;
    
    // Metadata storage for each NFT
    struct CardMetadata {
        string username;
        int256 totalProfitLoss;
        uint256 winRate;
        uint256 netWorth;
        uint256 mintTimestamp;
    }
    
    mapping(uint256 => CardMetadata) public cardMetadata;
    
    // Treasury address for collecting payments
    address public treasury;
    
    // Events
    event CardMinted(
        uint256 indexed tokenId,
        address indexed to,
        string username,
        uint256 timestamp
    );
    event ETHMintPriceUpdated(uint256 newPrice);
    event ERC20TokenConfigured(address indexed token, uint256 price);
    event ERC20TokenRemoved(address indexed token);
    event PaymentWithdrawn(address indexed token, uint256 amount);

    constructor(
        uint256 _mintPriceETH,
        address _treasury
    ) ERC721("Warplet Wrapped", "WPLTW") {
        mintPriceETH = _mintPriceETH;
        treasury = _treasury != address(0) ? _treasury : msg.sender;
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a card with ETH payment
     */
    function mintWithETH(
        string memory username,
        int256 totalProfitLoss,
        uint256 winRate,
        uint256 netWorth
    ) external payable returns (uint256) {
        require(msg.value >= mintPriceETH, "Insufficient ETH payment");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        cardMetadata[tokenId] = CardMetadata({
            username: username,
            totalProfitLoss: totalProfitLoss,
            winRate: winRate,
            netWorth: netWorth,
            mintTimestamp: block.timestamp
        });
        
        emit CardMinted(tokenId, msg.sender, username, block.timestamp);
        
        // Refund excess ETH
        if (msg.value > mintPriceETH) {
            (bool success, ) = msg.sender.call{value: msg.value - mintPriceETH}("");
            require(success, "Refund failed");
        }
        
        return tokenId;
    }

    /**
     * @dev Mint a card with ERC20 token payment
     */
    function mintWithERC20(
        address token,
        string memory username,
        int256 totalProfitLoss,
        uint256 winRate,
        uint256 netWorth
    ) external returns (uint256) {
        require(acceptedTokens[token], "Token not accepted");
        uint256 price = erc20MintPrices[token];
        require(price > 0, "Token price not set");
        
        require(
            IERC20(token).transferFrom(msg.sender, treasury, price),
            "Token transfer failed"
        );
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        cardMetadata[tokenId] = CardMetadata({
            username: username,
            totalProfitLoss: totalProfitLoss,
            winRate: winRate,
            netWorth: netWorth,
            mintTimestamp: block.timestamp
        });
        
        emit CardMinted(tokenId, msg.sender, username, block.timestamp);
        
        return tokenId;
    }

    /**
     * @dev Get card metadata
     */
    function getCardMetadata(uint256 tokenId) 
        external 
        view 
        returns (CardMetadata memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return cardMetadata[tokenId];
    }

    /**
     * @dev Update ETH mint price (owner only)
     */
    function setETHMintPrice(uint256 _price) 
        external 
        onlyOwner 
    {
        require(_price > 0, "Price must be greater than 0");
        mintPriceETH = _price;
        emit ETHMintPriceUpdated(_price);
    }

    /**
     * @dev Add or configure ERC20 token with price (owner only)
     */
    function setERC20Token(address token, uint256 price) 
        external 
        onlyOwner 
    {
        require(token != address(0), "Invalid token address");
        require(price > 0, "Price must be greater than 0");
        
        erc20MintPrices[token] = price;
        acceptedTokens[token] = true;
        
        emit ERC20TokenConfigured(token, price);
    }

    /**
     * @dev Update price for existing ERC20 token (owner only)
     */
    function updateERC20Price(address token, uint256 newPrice) 
        external 
        onlyOwner 
    {
        require(acceptedTokens[token], "Token not configured");
        require(newPrice > 0, "Price must be greater than 0");
        
        erc20MintPrices[token] = newPrice;
        emit ERC20TokenConfigured(token, newPrice);
    }

    /**
     * @dev Remove ERC20 token (owner only)
     */
    function removeERC20Token(address token) 
        external 
        onlyOwner 
    {
        require(acceptedTokens[token], "Token not configured");
        
        acceptedTokens[token] = false;
        erc20MintPrices[token] = 0;
        
        emit ERC20TokenRemoved(token);
    }

    /**
     * @dev Update treasury address (owner only)
     */
    function setTreasury(address _treasury) 
        external 
        onlyOwner 
    {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    /**
     * @dev Withdraw ETH from contract (owner only)
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = treasury.call{value: balance}("");
        require(success, "Withdrawal failed");
        emit PaymentWithdrawn(address(0), balance);
    }

    /**
     * @dev Emergency function to recover tokens sent to contract (owner only)
     */
    function recoverERC20(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to recover");
        require(IERC20(token).transfer(treasury, balance), "Transfer failed");
        emit PaymentWithdrawn(token, balance);
    }

    // Required overrides for ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
