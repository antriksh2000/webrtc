export function Card({ className = '', children }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ className = '', children }) {
  return <header className={`card-header ${className}`.trim()}>{children}</header>;
}

export function CardTitle({ children }) {
  return <h1 className="card-title">{children}</h1>;
}

export function CardDescription({ children }) {
  return <p className="card-description">{children}</p>;
}

export function CardContent({ className = '', children }) {
  return <div className={`card-content ${className}`.trim()}>{children}</div>;
}

export function Button({ className = '', variant = 'default', ...props }) {
  return <button className={`button button-${variant} ${className}`.trim()} {...props} />;
}

export function Input({ className = '', ...props }) {
  return <input className={`input ${className}`.trim()} {...props} />;
}

export function Label({ className = '', children, ...props }) {
  return (
    <label className={`label ${className}`.trim()} {...props}>
      {children}
    </label>
  );
}

