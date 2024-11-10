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
      {/* <div>{isVisible ? value : "?"}</div> */}
      <img
        src={isVisible ? `/cards/${value}.png` : `/cards/back.png`}
        alt="card"
      />
      {isVisible && [0, 22].includes(value) && (
        <div className="fool-value">
          <div>{value}</div>
        </div>
      )}
    </div>
  );
}
