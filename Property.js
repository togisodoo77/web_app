export class Property {
  constructor(data) {
    this.id       = data.id;
    this.title    = data.title;
    this.loc      = data.loc;
    this.category = data.category; // "гол" | "уул" | "vip" | "хөдөө"
    this.price    = data.price;
    this.rat      = data.rat;
    this.rev      = data.rev;
    this.guests   = data.guests;
    this.beds     = data.beds;
    this.baths    = data.baths;
    this.img      = data.img;
    this.alt      = data.alt;
    this.desc     = data.desc;
    this.ams      = Array.isArray(data.ams) ? data.ams : [];
  }

  matchesFilter(category) {
    if (!category || category === 'all') { return true; }
    return this.category === category;
  }
}