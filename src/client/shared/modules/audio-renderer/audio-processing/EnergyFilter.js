import { audioContext } from 'soundworks/client';
import MovingAverage from '../utils/MovingAverage';

class EnergyFilter {
  constructor({
    energyAvgOrder = 20,
    energyExp = 1/2,
    minCutoffFreq = 50,
    maxCutoffFreq = audioContext.sampleRate / 2,
    filterType = 'lowpass',
    energyIndex = 1,
  } = {}) {

    this.energyAvgOrder = energyAvgOrder;
    this.energyExp = energyExp;
    this.minCutoffFreq = minCutoffFreq;
    this.maxCutoffFreq = maxCutoffFreq;
    this.filterType = filterType;
    this.energyIndex = energyIndex;

    this.intensityFilter = new MovingAverage(this.energyAvgOrder);
    this.cutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const now = audioContext.currentTime;
    this.filter = audioContext.createBiquadFilter();
    this.filter.type = this.filterType;
    this.filter.frequency.linearRampToValueAtTime(this.maxCutoffFreq, now + 0.01);

    this.input = this.filter;
  }

  connect(output) {
    this.filter.connect(output);
  }

  disconnect() {
    this.filter.disconnect();
  }

  enableSensors() {
    const now = audioContext.currentTime;

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(this.minCutoffFreq, now + 0.01);
  }

  disableSensors() {
    const now = audioContext.currentTime;

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(this.maxCutoffFreq, now + 0.01);
  }

  processSensorsData(data) {
    const intensity = data[this.energyIndex];
    const avgIntesity = this.intensityFilter.process(intensity);
    const powIntensity = Math.pow(avgIntesity, this.energyExp);

    const now = audioContext.currentTime;
    const cutoffFrequency = this.minCutoffFreq * Math.exp(this.cutoffRatio * powIntensity);

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(cutoffFrequency, now + 0.01);
  }
}

export default EnergyFilter;
