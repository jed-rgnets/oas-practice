export function Footer() {
  return (
    <footer className="bg-[#16162a] border-t border-gray-700 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-gray-400">
        <p>
          OAS Practice - Practice writing OpenAPI 3.0 specifications.{' '}
          <a
            href="https://github.com/your-repo/oas-practice"
            className="text-primary-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Source
          </a>
        </p>
      </div>
    </footer>
  );
}
