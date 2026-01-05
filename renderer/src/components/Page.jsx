export const Page = ({ id, active, title, children }) => {
  return id === active ? (
    <div style={{ marginTop: 6 }}>
      <h3 style={{ margin: "10px 0" }}>{title}</h3>
      {children}
    </div>
  ) : null;
};
