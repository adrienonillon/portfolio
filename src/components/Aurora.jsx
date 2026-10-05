export default function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <div key={n} className={`aurora__shape aurora__shape--${n}`} />
      ))}
    </div>
  );
}
