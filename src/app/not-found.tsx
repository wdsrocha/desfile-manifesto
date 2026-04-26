import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream text-ink flex items-center justify-center px-6">
      <div className="text-center max-w-md flex flex-col gap-4 items-center">
        <span className="editorial-eyebrow">404</span>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight">
          Página fora de cena
        </h1>
        <p className="text-ink/70 text-sm sm:text-base">
          O endereço que você procurou não está no roteiro do Manifesto.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 border border-ink/15 hover:border-ink hover:bg-ink hover:text-cream transition-colors px-4 py-2.5 text-[11px] uppercase tracking-editorial"
        >
          Voltar para a passarela
        </Link>
      </div>
    </main>
  );
}
