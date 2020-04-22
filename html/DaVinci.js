const DEFAULT_BACKGROUND = 'rgb(200, 200, 200)';

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

class Stripe {
  constructor(start, end) {
    this._start = start;
    this._end = end;
  }

  static getDefaultStripes() {
    return new Stripe(new StripeComponent(DEFAULT_BACKGROUND, '0%'), new StripeComponent(DEFAULT_BACKGROUND, '100%'));
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  toString() {
    return `${this.start.toString()}, ${this.end.toString()}`;
  }
}

class DaVinci {
  constructor(target) {
    this.target = target;
    this.stripes = [Stripe.getDefaultStripes()];
  }

  getPalette() {
    console.log('[DaVinci] palette', this.stripes.map((s) => `${s.toString()}`).join(','));
    return this.stripes.map((s) => `${s.toString()}`).join(',');
  }

  resetCanvas() {
    this.stripes = [Stripe.getDefaultStripes()];
    this.draw();
  }

  addProgressStrip(color, start, end) {
    const stripe = new Stripe(new StripeComponent(color, start), new StripeComponent(color, end));
    const finalStripe = this.stripes.pop();

    finalStripe.start.position = stripe.end.position;

    this.stripes.push(stripe);
    this.stripes.push(finalStripe);
    this.draw();
  }

  draw() {
    console.log('[DaVinci] drawing on target', this.target);
    this.target.css('background', `linear-gradient(90deg, ${this.getPalette()})`);
  }
}
