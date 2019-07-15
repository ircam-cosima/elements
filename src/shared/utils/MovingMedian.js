
class MovingMedian {
  constructor(order = 5) {
    this.order = order;
    this.buffer = new Float32Array(order);
    this.pointer = 0;

    this.sorted = [];
  }

  process(value) {
    this.buffer[this.pointer] = value;
    this.pointer = (this.pointer + 1) % this.order;

    for (let i = 0; i < this.order; i++) {
      this.sorted[i] = this.buffer[i];
    }

    this.sorted.sort((a, b) => a < b ? -1 : 1);
    const ret = this.sorted[Math.floor(this.order / 2)];

    console.log(this.buffer, this.sorted, ret);

    return ret;
  }
}

export default MovingMedian;
