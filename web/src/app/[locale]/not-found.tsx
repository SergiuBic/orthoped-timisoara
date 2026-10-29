import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="container-site py-32 text-center">
      <h1 className="font-display text-5xl font-semibold">404</h1>
      <p className="mt-6">
        <Link href="/" className="underline underline-offset-4">
          ←
        </Link>
      </p>
    </div>
  );
}
