//prettier-ignore
export const ADDRESS = '0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd';
//prettier-ignore
export const ABI = [

  {

    inputs: [],

    stateMutability: 'nonpayable',

    type: 'constructor',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: true,

        internalType: 'address',

        name: 'owner',

        type: 'address',

      },

      {

        indexed: true,

        internalType: 'address',

        name: 'approved',

        type: 'address',

      },

      {

        indexed: true,

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'Approval',

    type: 'event',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: true,

        internalType: 'address',

        name: 'owner',

        type: 'address',

      },

      {

        indexed: true,

        internalType: 'address',

        name: 'operator',

        type: 'address',

      },

      {

        indexed: false,

        internalType: 'bool',

        name: 'approved',

        type: 'bool',

      },

    ],

    name: 'ApprovalForAll',

    type: 'event',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: false,

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

      {

        indexed: false,

        internalType: 'string',

        name: '_avatarLink',

        type: 'string',

      },

    ],

    name: 'AvatarUpdated',

    type: 'event',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: false,

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

      {

        indexed: false,

        internalType: 'string',

        name: '_lnk',

        type: 'string',

      },

    ],

    name: 'LinkUpdated',

    type: 'event',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: false,

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

      {

        indexed: false,

        internalType: 'address',

        name: '_from',

        type: 'address',

      },

      {

        indexed: false,

        internalType: 'address',

        name: '_to',

        type: 'address',

      },

    ],

    name: 'NameTransferred',

    type: 'event',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: true,

        internalType: 'address',

        name: 'previousOwner',

        type: 'address',

      },

      {

        indexed: true,

        internalType: 'address',

        name: 'newOwner',

        type: 'address',

      },

    ],

    name: 'OwnershipTransferred',

    type: 'event',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: true,

        internalType: 'address',

        name: 'from',

        type: 'address',

      },

      {

        indexed: true,

        internalType: 'address',

        name: 'to',

        type: 'address',

      },

      {

        indexed: true,

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'Transfer',

    type: 'event',

  },

  {

    anonymous: false,

    inputs: [

      {

        indexed: false,

        internalType: 'string',

        name: '_newURI',

        type: 'string',

      },

    ],

    name: 'UpdatedURI',

    type: 'event',

  },

  {

    inputs: [],

    name: 'FEE_AMT',

    outputs: [

      {

        internalType: 'uint256',

        name: '',

        type: 'uint256',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'to',

        type: 'address',

      },

      {

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'approve',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

      {

        internalType: 'address',

        name: 'owner',

        type: 'address',

      },

      {

        internalType: 'address',

        name: 'spender',

        type: 'address',

      },

    ],

    name: 'approveName',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'owner',

        type: 'address',

      },

    ],

    name: 'balanceOf',

    outputs: [

      {

        internalType: 'uint256',

        name: '',

        type: 'uint256',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'getApproved',

    outputs: [

      {

        internalType: 'address',

        name: '',

        type: 'address',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'getAttrLink',

    outputs: [

      {

        internalType: 'string',

        name: '',

        type: 'string',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'getAvatar',

    outputs: [

      {

        internalType: 'string',

        name: '',

        type: 'string',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: '_owner',

        type: 'address',

      },

    ],

    name: 'getNameFromOwner',

    outputs: [

      {

        internalType: 'string',

        name: '',

        type: 'string',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'getOwnerOfName',

    outputs: [

      {

        internalType: 'address',

        name: '',

        type: 'address',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'uint256',

        name: '_tokenID',

        type: 'uint256',

      },

    ],

    name: 'getOwnerOfTokenIdUsingERC721',

    outputs: [

      {

        internalType: 'address',

        name: '',

        type: 'address',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'owner',

        type: 'address',

      },

      {

        internalType: 'address',

        name: 'operator',

        type: 'address',

      },

    ],

    name: 'isApprovedForAll',

    outputs: [

      {

        internalType: 'bool',

        name: '',

        type: 'bool',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'isOwnedByMapping',

    outputs: [

      {

        internalType: 'bool',

        name: '',

        type: 'bool',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [],

    name: 'mintOpen',

    outputs: [

      {

        internalType: 'bool',

        name: '',

        type: 'bool',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [],

    name: 'name',

    outputs: [

      {

        internalType: 'string',

        name: '',

        type: 'string',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [],

    name: 'owner',

    outputs: [

      {

        internalType: 'address',

        name: '',

        type: 'address',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'ownerOf',

    outputs: [

      {

        internalType: 'address',

        name: '',

        type: 'address',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'registerName',

    outputs: [],

    stateMutability: 'payable',

    type: 'function',

  },

  {

    inputs: [],

    name: 'renounceOwnership',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'from',

        type: 'address',

      },

      {

        internalType: 'address',

        name: 'to',

        type: 'address',

      },

      {

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'safeTransferFrom',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'from',

        type: 'address',

      },

      {

        internalType: 'address',

        name: 'to',

        type: 'address',

      },

      {

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

      {

        internalType: 'bytes',

        name: '_data',

        type: 'bytes',

      },

    ],

    name: 'safeTransferFrom',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: '_token',

        type: 'address',

      },

      {

        internalType: 'uint256',

        name: '_amount',

        type: 'uint256',

      },

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'sendERC20ToName',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: '_token',

        type: 'address',

      },

      {

        internalType: 'uint256',

        name: '_tokenId',

        type: 'uint256',

      },

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'sendERC721ToName',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'sendFTMToName',

    outputs: [],

    stateMutability: 'payable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'operator',

        type: 'address',

      },

      {

        internalType: 'bool',

        name: 'approved',

        type: 'bool',

      },

    ],

    name: 'setApprovalForAll',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

      {

        internalType: 'string',

        name: '_avatar',

        type: 'string',

      },

    ],

    name: 'setAvatar',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_newURI',

        type: 'string',

      },

    ],

    name: 'setBaseURI',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

      {

        internalType: 'string',

        name: '_lnk',

        type: 'string',

      },

    ],

    name: 'setIPFSAttrLink',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'bytes4',

        name: 'interfaceId',

        type: 'bytes4',

      },

    ],

    name: 'supportsInterface',

    outputs: [

      {

        internalType: 'bool',

        name: '',

        type: 'bool',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [],

    name: 'symbol',

    outputs: [

      {

        internalType: 'string',

        name: '',

        type: 'string',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [],

    name: 'toggleMint',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'uint256',

        name: 'index',

        type: 'uint256',

      },

    ],

    name: 'tokenByIndex',

    outputs: [

      {

        internalType: 'uint256',

        name: '',

        type: 'uint256',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'owner',

        type: 'address',

      },

      {

        internalType: 'uint256',

        name: 'index',

        type: 'uint256',

      },

    ],

    name: 'tokenOfOwnerByIndex',

    outputs: [

      {

        internalType: 'uint256',

        name: '',

        type: 'uint256',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'tokenURI',

    outputs: [

      {

        internalType: 'string',

        name: '',

        type: 'string',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [],

    name: 'totalSupply',

    outputs: [

      {

        internalType: 'uint256',

        name: '',

        type: 'uint256',

      },

    ],

    stateMutability: 'view',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'from',

        type: 'address',

      },

      {

        internalType: 'address',

        name: 'to',

        type: 'address',

      },

      {

        internalType: 'uint256',

        name: 'tokenId',

        type: 'uint256',

      },

    ],

    name: 'transferFrom',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: '_from',

        type: 'address',

      },

      {

        internalType: 'address',

        name: '_to',

        type: 'address',

      },

      {

        internalType: 'string',

        name: '_name',

        type: 'string',

      },

    ],

    name: 'transferName',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

  {

    inputs: [

      {

        internalType: 'address',

        name: 'newOwner',

        type: 'address',

      },

    ],

    name: 'transferOwnership',

    outputs: [],

    stateMutability: 'nonpayable',

    type: 'function',

  },

];
