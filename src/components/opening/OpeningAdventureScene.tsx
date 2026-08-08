export function OpeningAdventureScene() {
  return (
    <div className="ml-opening-scene" aria-hidden>
      <img className="ml-opening-scene__art" src="./opening-hero-v2.webp" alt="" draggable={false} />
      <div className="ml-opening-scene__light" />
      <span className="ml-opening-orb ml-opening-orb--one" />
      <span className="ml-opening-orb ml-opening-orb--two" />
      <span className="ml-opening-orb ml-opening-orb--three" />
      <span className="ml-opening-spark ml-opening-spark--one">✦</span>
      <span className="ml-opening-spark ml-opening-spark--two">✦</span>
    </div>
  );
}
