# B2BUT Token contracts

Baked with <3 by [JincorTech](https://github.com/JincorTech/)

## UTT token requirements

* ERC-20 compilant standart
* Mintable
* Burnable
* Ownable
* Transfer Agents
* Initial supply: 1 527 700
* Decimals: 4

Currently this token is supposed to be used at the private sale stage and possibly in crowdsale in the future.

All transactions will be handled manually during private sale stage, so we need to send this tokens directly to provided wallet of the team(`0x18E5528F1590Bdf7E545a1893AB40432deEb934b`). This wallet receives investments and sends tokens.

All the tokens should  be frozen until we trigger release token function. No one except transfer agents is allowed to send tokens in case release state is false.



## How to setup development environment and run tests?

1. Install `docker` if you don't have it.
1. Clone this repo.
1. Run `docker-compose build --no-cache`.
1. Run `docker-compose up -d`.
You should wait a bit until Oraclize ethereum-bridge initialize. Wait for
`Please add this line to your contract constructor:
OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);`
message to appear. To check for it run `docker logs ico_oracle_1`.
1. Install dependencies: `docker-compose exec workspace yarn`.
1. To run tests: `docker-compose exec workspace truffle test`.
1. To merge your contracts via sol-merger run: `docker-compose exec workspace yarn merge`.
Merged contracts will appear in `merge` directory.
