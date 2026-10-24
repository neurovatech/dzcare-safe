import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="bg-white py-24">
      <Container className="text-center">
        <p className="text-6xl font-bold text-gold-dark">404</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">This page needs a repair</h1>
        <p className="mt-3 text-neutral-600">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/services" variant="outline">Our services</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
