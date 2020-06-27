/**
 * A StripeComponent represents a component
 * of a Stripe. Stripes need two components:
 * start and end. Each StripeComponent has a
 * color and position properties.
 */
class StripeComponent {
  constructor(color, position) {
    this._color = color;
    this._position = position;
  }

  get color() {
    return this._color;
  }

  get position() {
    return this._position;
  }

  set position(p) {
    this._position = p;
  }

  toString() {
    return `${this.color} ${this.position}`;
  }
}
