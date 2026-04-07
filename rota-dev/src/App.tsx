import RotaDevOnboardingForm from "./features/onboarding/components/RotaDevOnboardingForm";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <RotaDevOnboardingForm />
      </main>

      <footer className="w-full border-t border-zinc-900 bg-black py-5 text-center text-sm text-zinc-500">
        <p className="leading-relaxed">
          © {new Date().getFullYear()} Rota Dev. Todos os direitos reservados.
        </p>
        <a
          href="https://www.instagram.com/codebylilian"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-medium text-orange-500 transition hover:text-orange-400"
        >
          Criado por @codebylilian
        </a>
      </footer>
    </div>
  );
}

export default App;
