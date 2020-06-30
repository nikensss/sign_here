const DEFAULT_BACKGROUND = 'rgb(200, 200, 200)';

/**
 * A Stripe represents a coloured section using the
 * syntax of the gradient component for CSS (look at
 * the linear-gradient option for the background property).
 *
 * A Stripe requires two components: the start and the end.
 * Each can have a different color.
 * This class doesn't check that the position of the start
 * component is smaller than the position of end component.
 *
 * This class is tailored for usage in CSS#lineargradient as
 * the colors for the gradient.
 */
class Stripe {
  constructor(start, end) {
    this._start = start;
    this._end = end;
  }

  /**
   * Returns the default stripes. In this case, a single
   * Stripe that draws a stripe of one single color from
   * beginning to end.
   *
   * @return {Stripe} The default Stripe.
   */
  static getDefaultStripes() {
    return new Stripe(
      new StripeComponent(DEFAULT_BACKGROUND, '0%'),
      new StripeComponent(DEFAULT_BACKGROUND, '100%')
    );
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  /**
   * Converts this Stripe into a string that can be used
   * as part of the linear-gradient function in CSS. EG:
   *  'rgb(22,123,44) 22%, rgb(189,230,83) 34%'
   *
   * @return {string} The Stripe as a string (usables in the linear-gradient function of CSS).
   */
  toString() {
    return `${this.start.toString()}, ${this.end.toString()}`;
  }
}
