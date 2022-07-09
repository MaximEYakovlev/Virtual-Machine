class MemoryMapper {
  constructor() {
    this.regions = [];
  }

  map(device, start, end, remap = true) {
    const region = { device, start, end, remap };
    this.regions.unshift(region);

    return () => {
      this.regions = this.regions.filter((x) => x !== region);
    };
  }
}
