import { audioContext, client } from 'soundworks/client';

/**
 * this is needed because automations on ios are broken...
 * while chrome follows the spec and thus set the value without ramp now
 */

export function setParam(param, value) {
  if (client.platform.os === 'ios') {
    param.value = value;
  } else {
    const now = audioContext.currentTime;
    param.setValueAtTime(value, now);
  }
}

export function rampParam(param, value, duration) {
  if (client.platform.os = 'ios') {
    param.value = value;
  } else {
    const now = audioContext.currentTime;
    param.linearRampToValueAtTime(value, now + duration);
  }
}
