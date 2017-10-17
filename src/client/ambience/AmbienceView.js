import * as soundworks from 'soundworks/client';

const viewTemplate = `
  <h1>Ambience</h1>
`;

/**
 * @todo - move more logic into the template:
 *   * enable / disable clear buttons
 *   * update clear button text
 *   * active / inactive mute button
 */
class AmbienceView extends soundworks.View {
  constructor(model, events, options) {
    super(viewTemplate, model, events, options);
  }

}

export default AmbienceView;
