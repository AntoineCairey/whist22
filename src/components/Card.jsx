export default function Card({
  isHorizontal,
  isVisible,
  isClickable,
  value,
  handleCardClick,
}) {
  return (
    <div
      className={`card ${isHorizontal ? "horizontal" : ""}`}
      onClick={() => (isClickable ? handleCardClick(value) : null)}
    >
      <div>{isVisible ? value : "?"}</div>
    </div>
  );
}
