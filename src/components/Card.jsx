export default function Card({
  isVisible,
  isClickable,
  value,
  handleCardClick,
}) {
  return (
    <div
      className="card"
      onClick={() => (isClickable ? handleCardClick(value) : null)}
    >
      {isVisible ? value : "?"}
    </div>
  );
}
