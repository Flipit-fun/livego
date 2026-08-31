export default function Capabilities() {
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="caps">
        <div className="glass cap rv">
          <span className="k">Audio · Video</span>
          <h3>Speak from the token</h3>
          <p>
            The dev switches between voice and camera mid-stream without dropping
            the room. Holders hear it the second the mic goes on.
          </p>
        </div>
        <div className="glass cap rv">
          <span className="k">Screen · Window · Tab</span>
          <h3>Share what you&apos;re looking at</h3>
          <p>
            Put the chart, the contract, or the whole desktop on the stage at
            full resolution - not a compressed thumbnail.
          </p>
        </div>
        <div className="glass cap rv">
          <span className="k">Listen-only · Open chat</span>
          <h3>The room just listens</h3>
          <p>
            Only the dev broadcasts - no seat requests, no cross-talk. Holders
            join to watch and hear, and the chat stays open to everyone.
          </p>
        </div>
      </div>
    </section>
  );
}
