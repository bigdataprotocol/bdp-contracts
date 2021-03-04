// build inputs or outputs array from raw inputs string
// balanceOf(address _addr):(uint256 balance)
function buildInputsArray(rawInputsString) {
  let returnArray = []; // eslint-disable-line
  const rawMethodInputs = rawInputsString.split(',');

  // no inputs
  if (typeof rawMethodInputs === 'undefined' || rawMethodInputs.length === 0) {
    return [];
  }

  rawMethodInputs.forEach((rawMethodInput) => {
    const inputData = rawMethodInput.trim().split(' ');
    const type = inputData[0];
    const name = inputData[1] || '';

    // if type exists
    if (type !== '' && typeof type !== 'undefined') {
      returnArray.push({
        type,
        name,
      });
    }
  });

  return returnArray;
}

// parse a solidity method interface
function solidityToABI(methodInterface) {
  // count open and clsoed
  const methodABIObject = {};

  // not a string
  if (typeof methodInterface !== 'string') {
    throw new Error(`Method interface must be a string, currently ${typeof methodInterface}`);
  }

  // empty string
  if (methodInterface.length === 0) {
    throw new Error(`Solidity method interface must have a length greater than zero, currently ${methodInterface.length}`);
  }

  // count open brackets, closed brackets, colon count, outpouts and invalid characters
  const openBrackets = (methodInterface.match(/\(/g) || []).length;
  const closedBrackets = (methodInterface.match(/\)/g) || []).length;
  const colonCount = (methodInterface.match(/:/g) || []).length;
  const hasOutputs = openBrackets === 2 && closedBrackets === 2 && colonCount === 1;
  const hasInvalidCharacters = methodInterface.replace(/([A-Za-z0-9\_\s\,\:\[\](\)]+)/g, '').trim().length > 0; // eslint-disable-line

  // invalid characters
  if (hasInvalidCharacters) {
    throw new Error('Invalid Solidity method interface, your method interface contains invalid chars. Only letters, numbers, spaces, commas, underscores, brackets and colons.');
  }

  // method ABI object assembly
  methodABIObject.name = methodInterface.slice(0, methodInterface.indexOf('('));
  methodABIObject.type = 'function';
  methodABIObject.constant = false;
  const methodInputsString = methodInterface.slice(methodInterface.indexOf('(') + 1, methodInterface.indexOf(')')).trim();
  const methodOutputString = (hasOutputs && methodInterface.slice(methodInterface.lastIndexOf('(') + 1, methodInterface.lastIndexOf(')')) || '').trim();
  methodABIObject.inputs = buildInputsArray(methodInputsString);
  methodABIObject.outputs = buildInputsArray(methodOutputString);

  // check open brackets
  if (methodABIObject.name === '' || typeof methodABIObject.name === 'undefined') {
    throw new Error('Invalid Solidity method interface, no method name');
  }

  // check open brackets
  if (openBrackets !== 1 && openBrackets !== 2) {
    throw new Error(`Invalid Solidity method interface, too many or too little open brackets in solidity interface, currenlty only ${openBrackets} open brackets!`);
  }

  // check open brackets
  if (openBrackets !== 1 && openBrackets !== 2) {
    throw new Error('Invalid Solidity method interface, too many or too little open brackets in solidity interface!');
  }

  // check closed brackets
  if (closedBrackets !== 1 && closedBrackets !== 2) {
    throw new Error('Invalid Solidity method interface, too many or too little closed brackets in solidity interface!');
  }

  // check colon count
  if (colonCount !== 0 && colonCount !== 1) {
    throw new Error('Invalid Solidity method interface, to many or too little colons.');
  }

  // return method abi object
  return methodABIObject;
}

module.exports = {
  TRC20: require('./trc20'),
  RANDOM: require('./random'),
  GAME: require('./game'),
  GAME_CORE: require('./GameCoreContractABI'),
  parse: solidityToABI,
  payable: (abi) => {
    return Object.assign(abi, {
      payable: true,
      stateMutability: 'payable',
      constant: false
    })
  },
  view: (abi) => {
    return Object.assign(abi, {
      payable: false,
      stateMutability: 'view',
      constant: true
    })
  },
  write: (abi) => {
    return Object.assign(abi, {
      payable: false,
      stateMutability: 'nonpayable',
      constant: false
    })
  }
}