export default function BookCard({ book }) {
  return (
    <div className="book-card">
      <img
        src={book.image}
        alt={`Portada del libro ${book.name}`}
        className="book-image"
        onError={(e) => (e.target.src = "/placeholder.jpg")}
      />
      <h3 className="book-title">{book.name}</h3> 
    </div>
  );
}