import LogoMark from "./LogoMark";

export default function Footer() {
  return (
    <footer>
      <div className="foot">
        <div className="brand">
          <LogoMark size={22} />
          StreamGo
        </div>
        <span>Streaming on RobinHood Chain</span>
        <div className="foot-links">
          <a href="#holdings">Holdings</a>
          <a href="#studio">Studio</a>
          <a href="#rooms">Live now</a>
          <a
            href="https://x.com/TryStreamGo"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
        </div>
      </div>
    </footer>
  );
}
