# The ETH Bank Upgradable Proxy

## 1. Installation and Deployment
```shell
yarn
```
or
```shell
npm install
```

## 1. Test EthBank contact.

```shell
npx hardhat test
```
#### Result
![img.png](imgs/img.png)
## 2. Deploy Contracts(ERC20Token1, EthBank, EthBankV2)

#### 1) Deploy ERC20Token1 and EthBank contact on rinkey network
```shell
npx hardhat run ./scripts/deployEthBank.ts --network rinkeby
```
##### example:
![img_4.png](imgs/img_4.png)

#### 2) Save deployed ETHBank address to ETHBANK_ADDRESS in ".env" file.

![img_6.png](imgs/img_6.png)

#### 2) Update EthBank to EthBankV2 on rinkey network

```shell
npx hardhat run ./scripts/updateEthBank.ts --network rinkeby
```

![img_7.png](imgs/img_7.png)

## 2. Etherscan verification

#### 1)

![img_2.png](imgs/img_2.png)

#### 2)
![img_8.png](imgs/img_8.png)
#### 3) Verify the implementation contract
```shell
npx hardhat verify --network rinkeby [DEPLOYED_PROXY_ADDRESS]
```

![img_9.png](imgs/img_9.png)

#### 4)

![img_10.png](imgs/img_10.png)

#### 5)

![img_11.png](imgs/img_11.png)

# Deployment
## Contract Address

Rinkeby: https://rinkeby.etherscan.io/address/0x4ab23751E45A6AEEEE1Acbd67a1Ec682dd138DCF#code

  
