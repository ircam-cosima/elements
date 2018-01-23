
class MovingAverage {
  constructor(order = 10) {
    this.order = order;
    this.buffer = new Float32Array(order);
    this.pointer = 0;
  }

  process(value) {
    this.buffer[this.pointer] = value;
    this.pointer = (this.pointer + 1) % this.order;

    let sum = 0;

    for (let i = 0; i < this.order; i++)
      sum += this.buffer[i];

    const avg = sum / this.order;

    return avg;
  }
}

export default MovingAverage;
