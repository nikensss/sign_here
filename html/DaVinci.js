/**
 * The DaVinci class is responsible for painting
 * the progress bar as a series of stripes.
 * Each stripe can be of different colors and widths.
 * The stripes should be of the class Stripe.
 *
 * It will use the HTML entity defined by the input
 * canvas element (must be a jQuery object) and it will
 * change its background property.
 */
class DaVinci {
  constructor(canvas) {
    this.canvas = canvas;
    this.stripes = [Stripe.getDefaultStripes()];
  }

  /**
   * Returns the color section to be used in the linea-gradient
   * function of CSS. Converts all the stripes to the required
   * string format for proper visualization.
   *
   * @return {string} The palette to be painted.
   */
  getPalette() {
    return this.stripes.map((s) => `${s.toString()}`).join(',');
  }

  /**
   * Resets the stripes to the default stripes defined in
   * Stripe#getDefaultStripes.
   */
  resetCanvas() {
    this.stripes = [Stripe.getDefaultStripes()];
  }

  /**
   * Creates a new stripe. It will be visible after the next
   * DaVinci#draw.
   *
   * @param {string} color the color of the new stripe
   * @param {string} start the starting position
   * @param {string} end  the end position
   */
  addProgressStripe(color, start, end) {
    const stripe = new Stripe(new StripeComponent(color, start), new StripeComponent(color, end));
    const finalStripe = this.stripes.pop();

    finalStripe.start.position = stripe.end.position;

    this.stripes.push(stripe);
    this.stripes.push(finalStripe);
  }

  draw() {
    this.canvas.css('background', `linear-gradient(90deg, ${this.getPalette()})`);
  }
}
