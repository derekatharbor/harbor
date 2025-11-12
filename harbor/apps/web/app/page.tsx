export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-heading font-bold mb-4">Harbor</h1>
        <p className="text-xl text-softgray mb-8">
          See how AI sees your brand
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-primary">
            Get Started
          </button>
          <button className="btn-secondary">
            Request Demo
          </button>
        </div>
      </div>
    </main>
  )
}
