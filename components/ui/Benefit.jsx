function Benefit({ icon, title, text }) {
  return (
    <div className="benefit">
      <span>{icon}</span>
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}
export default Benefit;
