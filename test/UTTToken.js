const UTTToken = artifacts.require("UTTToken");
const assertJump = function(error) {
  assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Invalid opcode error must be returned');
};

contract('UTTToken', function(accounts) {
  it("should put 1527700 UTT to supply and in the first account", async function () {
    const instance = await UTTToken.new();
    const balance = await instance.balanceOf(accounts[0]);
    const supply = await instance.totalSupply();

    assert.equal(balance.valueOf(), 1527700 * 10 ** 4, "First account (owner) balance must be 1527700");
    assert.equal(supply.valueOf(), 1527700 * 10 ** 4, "Supply must be 1527700");
  });

  it("should not allow to set releaseAgent by not owner", async function () {
    const instance = await UTTToken.new();

    try {
      await instance.setReleaseAgent(accounts[1], {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow to set releaseAgent by owner when token is released", async function () {
    const instance = await UTTToken.new();
    await instance.setReleaseAgent(accounts[0]);
    instance.release();

    try {
      await instance.setReleaseAgent(accounts[1]);
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should allow to set releaseAgent by owner", async function () {
    const instance = await UTTToken.new();

    await instance.setReleaseAgent(accounts[1]);
    const releaseAgent = await instance.releaseAgent();
    assert.equal(releaseAgent, accounts[1])
  });

  it("should not allow to set transferAgent by not owner", async function () {
    const instance = await UTTToken.new();

    try {
      await instance.setTransferAgent(accounts[1], true, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should allow to set transferAgents by owner", async function () {
    const instance = await UTTToken.new();

    await instance.setTransferAgent(accounts[1], true);
    const value = await instance.transferAgents(accounts[1]);
    assert.equal(value, true)
  });

  it("should not allow to set transferAgents by owner when contract is released", async function () {
    const instance = await UTTToken.new();
    await instance.setReleaseAgent(accounts[0]);
    instance.release();

    try {
      await instance.setTransferAgent(accounts[1], true);
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow to release by not release agent", async () => {
    let token = await UTTToken.new();
    await token.setReleaseAgent(accounts[1]);

    try {
      await token.release();
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should allow to release by release agent", async () => {
    let token = await UTTToken.new();

    await token.setReleaseAgent(accounts[1]);
    await token.release({from: accounts[1]});
    const released = await token.released();
    assert.equal(released, true);

    //should not release again if already released
    try {
      await token.release({from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow transfer when token is not released and 'sender' is not added to transferAgents map", async function() {
    let token = await UTTToken.new();

    try {
      await token.transfer(accounts[1], 100);
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should allow transfer when token is released", async function() {
    let token = await UTTToken.new();
    await token.setReleaseAgent(accounts[0]);
    await token.release();

    await token.transfer(accounts[1], 100 * 10 ** 4);

    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.valueOf(), 1527600 * 10 ** 4);

    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.valueOf(), 100 * 10 ** 4);
  });

  it("should allow transfer when token is released - fractional value", async function() {
    let token = await UTTToken.new();
    await token.setReleaseAgent(accounts[0]);
    await token.release();

    await token.transfer(accounts[1], 0.0001 * 10 ** 4);

    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.valueOf(), 1527699.9999 * 10 ** 4);

    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.valueOf(), 0.0001 * 10 ** 4);
  });

  it("should allow transfer when token is not released but sender is added to transferAgents", async function() {
    let token = await UTTToken.new();

    await token.setTransferAgent(accounts[0], true);

    await token.transfer(accounts[1], 100 * 10 ** 4);

    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.valueOf(), 1527600 * 10 ** 4);

    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.valueOf(), 100 * 10 ** 4);
  });

  it("should not allow transfer to 0x0", async function() {
    let token = await UTTToken.new();

    await token.setTransferAgent(accounts[0], true);

    try {
      await token.transfer(0x0, 100 * 10 ** 4);
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow transfer from to 0x0", async function() {
    let token = await UTTToken.new();

    await token.setTransferAgent(accounts[0], true);
    await token.approve(accounts[1], 100 * 10 ** 4);

    try {
      await token.transferFrom(accounts[0], 0x0, 100 * 10 ** 4, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow transferFrom when token is not released and 'from' is not added to transferAgents map", async function() {
    let token = await UTTToken.new();
    await token.approve(accounts[1], 100 * 10 ** 4);

    try {
      await token.transferFrom(accounts[0], accounts[2], 100 * 10 ** 4, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should allow transferFrom when token is released", async function() {
    let token = await UTTToken.new();
    await token.setReleaseAgent(accounts[0]);
    await token.release();

    await token.approve(accounts[1], 100 * 10 ** 4);
    await token.transferFrom(accounts[0], accounts[2], 100 * 10 ** 4, {from: accounts[1]});

    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.valueOf(), 1527600 * 10 ** 4);

    const balance1 = await token.balanceOf(accounts[2]);
    assert.equal(balance1.valueOf(), 100 * 10 ** 4);

    const balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance2.valueOf(), 0);
  });

  it("should allow transferFrom for transferAgent when token is not released", async function() {
    let token = await UTTToken.new();
    await token.setTransferAgent(accounts[0], true);

    await token.approve(accounts[1], 100 * 10 ** 4);
    await token.transferFrom(accounts[0], accounts[2], 100 * 10 ** 4, {from: accounts[1]});

    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.valueOf(), 1527600 * 10 ** 4);

    const balance1 = await token.balanceOf(accounts[2]);
    assert.equal(balance1.valueOf(), 100 * 10 ** 4);

    const balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance2.valueOf(), 0);
  });

  it("should allow to burn by owner", async function() {
    let token = await UTTToken.new();
    await token.burn(1000 * 10 ** 4);

    const balance = await token.balanceOf(accounts[0]).valueOf();
    assert.equal(balance, 1526700 * 10 ** 4);

    const supply = await token.totalSupply().valueOf();
    assert.equal(supply, 1526700 * 10 ** 4);
  });

  it("should not allow to burn by not owner", async function() {
    let token = await UTTToken.new();
    await token.setTransferAgent(accounts[0], true);
    await token.transfer(accounts[1], 1000 * 10 ** 4);

    try {
      await token.burn(1000 * 10 ** 4, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow to burn more than balance", async function() {
    let token = await UTTToken.new();

    try {
      await token.burn(1527701 * 10 ** 4);
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should allow to burn from by owner", async function() {
    let token = await UTTToken.new();
    await token.setTransferAgent(accounts[0], true);
    await token.transfer(accounts[1], 1000000 * 10 ** 4);
    await token.approve(accounts[0], 500000 * 10 ** 4, {from: accounts[1]});
    await token.burnFrom(accounts[1], 500000 * 10 ** 4);

    const balance = await token.balanceOf(accounts[1]).valueOf();
    assert.equal(balance, 500000 * 10 ** 4);

    const supply = await token.totalSupply().valueOf();
    assert.equal(supply, 1027700 * 10 ** 4);

    //should not allow to burn more
    try {
      await token.burnFrom(accounts[1], 1);
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow to burn from by not owner", async function() {
    let token = await UTTToken.new();
    await token.setTransferAgent(accounts[0], true);
    await token.transfer(accounts[1], 1000000 * 10 ** 4);
    await token.approve(accounts[2], 500000 * 10 ** 4, {from: accounts[1]});

    try {
      await token.burnFrom(accounts[1], 500000 * 10 ** 4, {from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should not allow to burn from more than balance", async function() {
    let token = await UTTToken.new();
    await token.setTransferAgent(accounts[0], true);
    await token.transfer(accounts[1], 500000 * 10 ** 4);
    await token.approve(accounts[0], 1000000 * 10 ** 4, {from: accounts[1]});

    try {
      await token.burnFrom(accounts[1], 500001 * 10 ** 4);
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });
});
