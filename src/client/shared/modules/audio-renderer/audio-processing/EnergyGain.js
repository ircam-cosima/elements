import { audioContext } from 'soundworks/client';
import MovingAverage from '../utils/MovingAverage';

class EnergyGain {
  constructor({
    energyAvgOrder = 20,
    energyExp = 1,
    energyIndex = 1,
  } = {}) {
    this.energyAvgOrder = energyAvgOrder;
    this.energyExp = energyExp;
    this.energyIndex = energyIndex;

    this.intensityFilter = new MovingAverage(this.energyAvgOrder);

    const now = audioContext.currentTime;
    this.gain = audioContext.createGain();
    this.gain.gain.value = 0;
    this.gain.gain.setValueAtTime(0, now);
    this.gain.gain.linearRampToValueAtTime(1, now + 0.01);

    this.input = this.gain;
  }

  connect(output) {
    this.gain.connect(output);
  }

  disconnect() {
    this.gain.disconnect();
  }

  enableSensors() {
    const now = audioContext.currentTime;

    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(0, now + 0.01);
  }

  disableSensors() {
    const now = audioContext.currentTime;

    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(1, now + 0.01);
  }

  processSensorsData(data) {
    const now = audioContext.currentTime;
    const intensity = data[this.energyIndex];
    const avgIntesity = this.intensityFilter.process(intensity);
    const powIntensity = Math.pow(avgIntesity, this.energyExp);

    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(powIntensity, now + 0.01);
  }
}

export default EnergyGain;
