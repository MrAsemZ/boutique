export default function PageWrapper({ children }) {
  return (
    <main
      className="flex-1"
      style={{ transition: 'background-color 0.4s ease' }}
    >
      {children}
    </main>
  );
}
