module.exports = class TokenStream {
  constructor(nodes, parent) {
    this.nodes = nodes;
    this.parent = parent;
    this.lastFunction = null;
    this.lastValue = null;
  }

  get node() {
    return this.nodes[0];
  }

  hasTokens() {
    return this.nodes.length > 0;
  }

  lookahead() {
    return new TokenStream(this.nodes.slice(1), this.parent);
  }

  match(...tokenDescriptors) {
    const node = this.node;

    if (!node) return null;

    /* eslint-disable no-restricted-syntax */
    for (const tokenDescriptor of tokenDescriptors) {
      const value = tokenDescriptor(node);

      if (value !== null) {
        this.nodes = this.nodes.slice(1);
        this.lastFunction = null;
        this.lastValue = value;
        return value;
      }
    }
    /* eslint-enable */

    return null;
  }

  expect(...tokenDescriptors) {
    const value = this.match(...tokenDescriptors);
    if (value !== null) return value;
    return this.throw();
  }

  matchFunction() {
    const node = this.node;
    if (node.type !== 'function') return null;
    const value = new TokenStream(node.nodes, node);
    this.nodes = this.nodes.slice(1);
    this.lastFunction = value;
    this.lastValue = null;
    return value;
  }

  expectFunction() {
    const value = this.matchFunction();
    if (value !== null) return value;
    return this.throw();
  }

  expectEmpty() {
    if (this.hasTokens()) this.throw();
  }

  throw() {
    throw new Error(`Unexpected token type: ${this.node.type}`);
  }
};
